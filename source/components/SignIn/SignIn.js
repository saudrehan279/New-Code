import React, { Component } from "react";
import {
  Platform,
  ActivityIndicator,
  Text,
  View,
  AsyncStorage,
  Image,
  ImageBackground,
  TouchableOpacity,
  I18nManager,
  TextInput,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
} from "react-native";
import {
  INDICATOR_COLOR,
  INDICATOR_SIZE,
  OVERLAY_COLOR,
} from "../../../styles/common";
import { width, height, totalSize } from "react-native-dimension";
import Toast from "react-native-simple-toast";
import Icon from "react-native-vector-icons/Octicons";
import IconLock from "react-native-vector-icons/SimpleLineIcons";
import { observer } from "mobx-react";
import store from "../../Stores/orderStore";
import Store from "../../Stores";
import styles from "../../../styles/SignIn";
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from "@react-native-community/google-signin";
import ApiController from "../../ApiController/ApiController";
import LocalDB from "../../LocalDB/LocalDB";
import Storage from "../../LocalDB/storage";
import {
  LoginManager,
  AccessToken,
  GraphRequest,
  GraphRequestManager,
} from "react-native-fbsdk";

export default class SignIn extends Component<Props> {
  constructor(props) {
    let { orderStore } = Store;
    let data = orderStore.settings.data;
    super(props);
    this.state = {
      loading: false,
      isPasswordHide: true,
      password: "", //12345
      email: "", //usama@gmail.com
    };
  }
  static navigationOptions = {
    header: null,
  };
  componentWillMount = async () => {
    GoogleSignin.configure({
      iosClientId:
        "191792720370-rc4ospf26req749phf3d4l4sfj74gmf4.apps.googleusercontent.com",
    });
  };
  //// Google Login Methode
  handleGoogleSignIn = async () => {
    console.log("Google login");
    GoogleSignin.signIn()
      .then(async (user) => {
        console.log("Google login", user);
        //Calling local func for login through google
        store.LOGIN_SOCIAL_TYPE = "social";
        store.LOGIN_TYPE = "google";
        await this.socialLogin(user.user.email, user.user.name, "apple@321");
      })
      .catch((err) => {
        console.warn(err);
      })
      .done();
  };
  fbsdk = () => {
    // Attempt a login using the Facebook login dialog asking for default permissions.
    LoginManager.logInWithPermissions(["public_profile", "email"]).then(
      (result) => {
        if (result.isCancelled) {
          Toast.show(
            "It must be your network issue, please try again.",
            Toast.LONG
          );
        } else {
          const infoRequest = new GraphRequest(
            "/me?fields=id,first_name,last_name,name,picture.type(large),email,gender",
            null,
            this._responseInfoCallback
          );
          new GraphRequestManager().addRequest(infoRequest).start();
        }
      },
      function(error) {
        Toast.show(
          "It must be your network issue, please try again.",
          Toast.LONG
        );
        // console.log("Login fail with error: " + error);
      }
    );
  };
  //Create response callback.
  _responseInfoCallback = async (error: ?Object, result: ?Object) => {
    if (error) {
      // console.log('Error fetching data: ' + error.toString());
    } else {
      store.LOGIN_SOCIAL_TYPE = "social";
      store.LOGIN_TYPE = "facebook";
      await this.socialLogin(result.email, result.name, "apple@321");
      // console.log('Success fetching data: ', result);
    }
  };
  //// Custom Social Login methode
  socialLogin = async (email, name, password) => {
    // if (this.state.email.length > 0 && this.state.password.length > 0) {
    var Email, Password;
    // Email = this.state.email;
    // Password = this.state.password;
    // } else {
    Email = email;
    Password = password;
    // }
    let { orderStore } = Store;
    this.setState({ loading: true });
    let params = {
      name: name,
      email: email,
      type: "social",
    };
    //API Calling

    let response = await ApiController.post("login", params);
    console.log("login user =", response);
    if (response.success === true) {
      // Storage.setItem('email', Email)
      // Storage.setItem('password', Password)
      await LocalDB.saveProfile(Email, Password, response.data);

      Storage.setItem("issocial", true);

      let responseSetting = await ApiController.post("settings");

      orderStore.settings = responseSetting;
      if (orderStore.settings.success === true) {
        orderStore.statusbar_color = orderStore.settings.data.navbar_clr;
        orderStore.wpml_settings = orderStore.settings.data.wpml_settings;
      }

      this.setState({ loading: false });
      orderStore.login.loginStatus = true;
      orderStore.login.loginResponse = response;
      this.props.navigation.push("Drawer");
    }
  };
  validate = () => {
    let { orderStore } = Store;

    if (this.state.email == "" || this.state.password == "") {
      Toast.show(orderStore.settings.data.main_screen.validation);
      return false;
    }
    return true;
  };
  //// Login Post
  login = async () => {
    Keyboard.dismiss();
    let isValid = this.validate();
    // console.log('is ',isValid)
    if (isValid == true) {
      let { orderStore } = Store;
      this.setState({ loading: true });
      let params = {
        email: this.state.email,
        password: this.state.password,
      };
      //Api calling
      let response = await ApiController.post("login", params);
      console.log("login oooooooooooooooooo user =", response);
      if (response.success === true) {
        store.LOGIN_TYPE = "local";
        Storage.setItem("email", this.state.email);
        Storage.setItem("password", this.state.password);
        Storage.setItem("issocial", false);

        await LocalDB.saveProfile(
          this.state.email,
          this.state.password,
          response.data
        );

        orderStore.login.loginStatus = true;
        orderStore.login.loginResponse = response;
        orderStore.settings.data.package = response.data.package;
        this.setState({ loading: false });
        this.props.navigation.push("Drawer");
      } else {
        this.setState({ loading: false });
        Toast.show(response.message);
      }
    }
  };
  render() {
    let { orderStore } = Store;
    let data = orderStore.settings.data;
    return (
      <View style={styles.container}>
        <ImageBackground
          source={require("../../images/bk_ground.png")}
          style={styles.imgCon}
        >
          <ImageBackground
            source={require("../../images/Downtown_Shadownew.png")}
            style={styles.imgCon}
          >
            <View style={{ flex: 1 }}>
              <KeyboardAvoidingView
                behavior={Platform.Os == "ios" ? "padding" : "height"}
                style={styles.container}
              >
                <View
                  style={{
                    height: height(5),
                    width: width(100),
                    flexDirection: "row",
                  }}
                >
                  <TouchableOpacity
                    style={styles.bckImgCon}
                    onPress={() => this.props.navigation.goBack()}
                  >
                    <Image
                      source={require("../../images/back_btn.png")}
                      style={styles.backBtn}
                    />
                  </TouchableOpacity>
                  <View
                    style={{
                      flex: 1,
                      justifyContent: "flex-end",
                      marginHorizontal: 25,
                    }}
                  >
                    <Text style={styles.headerTxt}>
                      {data.main_screen.sign_in}
                    </Text>
                  </View>
                </View>
                <View style={styles.logoView}>
                  <Image source={{ uri: data.logo }} style={styles.logoImg} />
                  <View style={styles.logoTxttop}>
                    <Text style={[styles.inerText, { color: "yellow" }]}>
                      A
                    </Text>
                    <Text style={[styles.inerText, { color: "limegreen" }]}>
                      u
                    </Text>
                    <Text style={[styles.inerText, { color: "cyan" }]}>t</Text>
                    <Text style={[styles.inerText, { color: "blue" }]}>i</Text>
                    <Text style={[styles.inerText, { color: "yellow" }]}>
                      s
                    </Text>
                    <Text style={[styles.inerText, { color: "limegreen" }]}>
                      m
                    </Text>
                    <Text style={[styles.inerText, { color: "cyan" }]}>K</Text>
                    <Text style={[styles.inerText, { color: "red" }]}>e</Text>
                    <Text style={[styles.inerText, { color: "blue" }]}>n</Text>
                    <Text style={[styles.inerText, { color: "yellow" }]}>
                      X
                    </Text>
                    <Text style={[styles.inerText, { color: "limegreen" }]}>
                      t
                    </Text>
                    <Text style={[styles.inerText, { color: "cyan" }]}>i</Text>
                    <Text style={[styles.inerText, { color: "blue" }]}>o</Text>
                    <Text style={[styles.inerText, { color: "limegreen" }]}>
                      n
                    </Text>
                  </View>
                  <Text style={styles.logoTxt}>
                    Find professionals, join our Coummunity and Donate
                  </Text>
                </View>
                <View style={styles.buttonView}>
                  <View
                    style={styles.btn}
                    onPress={() => {
                      this.props.navigation.navigate("Login");
                    }}
                  >
                    <View style={{ marginHorizontal: 10 }}>
                      {/* <Image source={require('../../images/mail.png')} style={styles.mail} /> */}
                      <Icon name="mail" color="white" size={24} />
                    </View>
                    <View style={{ flex: 4.1 }}>
                      <TextInput
                        onChangeText={(value) =>
                          this.setState({ email: value })
                        }
                        underlineColorAndroid="transparent"
                        placeholder={data.main_screen.email_placeholder}
                        placeholderTextColor="white"
                        textContentType="emailAddress"
                        keyboardType="email-address"
                        autoCapitalize={false}
                        underlineColorAndroid="transparent"
                        autoCorrect={true}
                        style={[styles.inputTxt]}
                      />
                    </View>
                  </View>
                  <View
                    style={styles.btn}
                    onPress={() => {
                      this.props.navigation.navigate("Login");
                    }}
                  >
                    <View style={{ marginHorizontal: 10 }}>
                      {/* <Image source={require('../../images/password.png')} style={styles.mail} /> */}
                      <IconLock name="lock" color="white" size={24} />
                    </View>
                    <View style={{ flex: 4.1 }}>
                      <TextInput
                        onChangeText={(value) =>
                          this.setState({ password: value })
                        }
                        underlineColorAndroid="transparent"
                        placeholder={data.main_screen.password_placeholder}
                        secureTextEntry={this.state.isPasswordHide}
                        placeholderTextColor="white"
                        underlineColorAndroid="transparent"
                        // autoCorrect={true}
                        autoCapitalize="none"
                        style={styles.inputTxt}
                      />
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        this.setState({
                          isPasswordHide: !this.state.isPasswordHide,
                        });
                      }}
                      style={{ marginHorizontal: 10 }}
                    >
                      <IconLock name="eye" color="white" size={24} />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.signUpBtn,
                      { backgroundColor: orderStore.settings.data.main_clr },
                    ]}
                    onPress={() => this.login()}
                  >
                    <Text style={styles.signUpTxt}>
                      {data.main_screen.sign_in}
                    </Text>
                  </TouchableOpacity>
                  {/* <View style={styles.fgBtn}>
                    {
                      true ?
                        <TouchableOpacity style={{ width: width(37.2), height: height(5), borderRadius: 3, backgroundColor: 'transparent', backgroundColor: '#134A7C', justifyContent: 'center', alignItems: 'center' }}
                          onPress={() => { this.fbsdk() }}
                        >
                          <Text style={styles.socialBtnText}>{data.main_screen.fb_btn}</Text>
                        </TouchableOpacity>
                        :
                        null
                    }
                    {
                      true ?
                        <Text style={styles.orTxt}>{data.main_screen.separator}</Text>
                        :
                        null
                    }
                    {
                      true ?
                        <TouchableOpacity style={{ width: width(37), height: height(5), borderRadius: 3, backgroundColor: 'transparent', backgroundColor: '#DB4437', justifyContent: 'center', alignItems: 'center' }}
                          onPress={() => { this.handleGoogleSignIn() }}
                        >
                          <Text style={styles.socialBtnText}>{data.main_screen.g_btn}</Text>
                        </TouchableOpacity>
                        :
                        null
                    }

                  </View> */}
                  <View
                    style={{
                      flex: 1,
                      alignContent: "center",
                      justifyContent: "center",
                    }}
                  >
                    {!this.state.loading ? null : (
                      <ActivityIndicator
                        size={INDICATOR_SIZE}
                        color={store.settings.data.navbar_clr}
                        animating={true}
                        hidesWhenStopped={true}
                      />
                    )}
                  </View>
                </View>
                <View style={styles.footer}>
                  <Text
                    style={styles.forgetpwrd}
                    onPress={() =>
                      this.props.navigation.navigate("ForgetPassword")
                    }
                  >
                    {data.main_screen.forgot_text}
                  </Text>
                  <Text
                    style={styles.newHere}
                    onPress={() => this.props.navigation.navigate("SignUp")}
                  >
                    {data.main_screen.new_member}
                  </Text>
                  {/* <Text style={styles.signInT} onPress={() => this.props.navigation.navigate('SignUp')}>{data.main_screen.sign_up}</Text> */}
                </View>
              </KeyboardAvoidingView>
            </View>
          </ImageBackground>
        </ImageBackground>
      </View>
    );
  }
}
