import React, { Component } from "react";
import {
  Platform,
  ActivityIndicator,
  Text,
  View,
  Button,
  Image,
  ImageBackground,
  TouchableOpacity,
  I18nManager,
  TextInput,
  KeyboardAvoidingView,
} from "react-native";
import {
  INDICATOR_COLOR,
  INDICATOR_SIZE,
  OVERLAY_COLOR,
} from "../../../styles/common";
import { width, height, totalSize } from "react-native-dimension";
import { observer } from "mobx-react";
import Store from "../../Stores";
import store from "../../Stores/orderStore";
import styles from "../../../styles/SignUp";
import Icon from "react-native-vector-icons/Octicons";
import IconLock from "react-native-vector-icons/SimpleLineIcons";
import IconUser from "react-native-vector-icons/FontAwesome";
import {
  GoogleSignin,
  GoogleSigninButton,
} from "@react-native-community/google-signin";
import Toast from "react-native-simple-toast";
import ApiController from "../../ApiController/ApiController";
import LocalDB from "../../LocalDB/LocalDB";
import {
  LoginManager,
  AccessToken,
  GraphRequest,
  GraphRequestManager,
} from "react-native-fbsdk";
import { SignInWithAppleButton } from "react-native-apple-authentication";

import { widthPercentageToDP as wp } from "../../helpers/Responsive";

@observer
export default class SignUp extends Component<Props> {
  constructor(props) {
    let { orderStore } = Store;
    let data = orderStore.settings.data;
    super(props);
    this.state = {
      loading: false,
      name: "",
      email: "",
      password: "",
    };
    // I18nManager.forceRTL(true);
  }
  static navigationOptions = {
    header: null,
  };
  componentWillMount() {
    GoogleSignin.configure({
      iosClientId:
        "191792720370-rc4ospf26req749phf3d4l4sfj74gmf4.apps.googleusercontent.com",
    });
  }
  // Google SignUp
  handleGoogleSignIn = () => {
    GoogleSignin.signIn()
      .then(
        (func = async (user) => {
          //Calling local func for login through google
          store.LOGIN_SOCIAL_TYPE = "social";
          store.LOGIN_TYPE = "google";
          await this.socialSignUp(user.user.email, user.user.name, "apple@321");
          console.log("Google login", user);
        })
      )
      .catch((err) => {
        console.warn(err);
      })
      .done();
  };
  // FaceBook SignUp
  fbLogin = async () => {
    // Attempt a login using the Facebook login dialog asking for default permissions.
    LoginManager.logInWithPermissions(["public_profile", "email"]).then(
      (functionFun = (result) => {
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
      }),
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
      await this.socialSignUp(result.email, result.name, "apple@321");
      // console.log('Success fetching data: ', result);
    }
  };
  //// Custom Social Login methode
  //// Custom Social Login methode
  socialSignUp = async (email, name, password) => {
    if (this.state.email.length > 0 && this.state.password.length > 0) {
      var Email, Password;
      Email = this.state.email;
      Password = this.state.password;
    } else {
      Email = email;
      Password = password;
    }
    let { orderStore } = Store;
    this.setState({ loading: true });
    let params = {
      name: name,
      email: email,
      type: "social",
    };
    //API Calling
    let response = await ApiController.post("login", params);
    // console.log('login user =', response);
    if (response.success === true) {
      await LocalDB.saveProfile(Email, Password, response.data);

      let responseSetting = await ApiController.post("settings");

      orderStore.settings = responseSetting;
      if (orderStore.settings.success === true) {
        orderStore.statusbar_color = orderStore.settings.data.navbar_clr;
        orderStore.wpml_settings = orderStore.settings.data.wpml_settings;
      }
      this.setState({ loading: false });
      orderStore.login.loginStatus = true;
      orderStore.login.loginResponse = response;
      this.props.navigation.replace("Drawer");
    }
  };
  register = async () => {
    this.setState({ loading: true });
    let params = {
      name: this.state.name,
      email: this.state.email,
      password: this.state.password,
    };
    let response = await ApiController.post("register", params);
    console.log("signup user =", response);
    if (response.success === true) {
      store.login.loginStatus = true;
      store.LOGIN_TYPE = "local";
      await LocalDB.saveProfile(
        this.state.email,
        this.state.password,
        response.data
      );
      store.login.loginResponse = response;
      this.props.navigation.replace("Drawer");
    } else {
      this.setState({ loading: false });
      Toast.show(response.message, Toast.LONG);
    }
  };

  appleSignIn = (result) => {
    console.log("Resssult", result);
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
            <KeyboardAvoidingView
              behavior={Platform.OS == "ios" ? "padding" : "height"}
              style={styles.container}
            >
              <View style={{ height: height(5), flexDirection: "row" }}>
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
                    flex: 0.5,
                    justifyContent: "flex-end",
                    marginHorizontal: 25,
                  }}
                >
                  <Text style={styles.headerTxt}>
                    {data.main_screen.sign_up}
                  </Text>
                </View>
              </View>
              <View style={styles.logoView}>
                <Image source={{ uri: data.logo }} style={styles.logoImg} />
                <View style={styles.logoTxttop}>
                  <Text style={[styles.inerText, { color: "yellow" }]}>A</Text>
                  <Text style={[styles.inerText, { color: "limegreen" }]}>
                    u
                  </Text>
                  <Text style={[styles.inerText, { color: "cyan" }]}>t</Text>
                  <Text style={[styles.inerText, { color: "blue" }]}>i</Text>
                  <Text style={[styles.inerText, { color: "yellow" }]}>s</Text>
                  <Text style={[styles.inerText, { color: "limegreen" }]}>
                    m
                  </Text>
                  <Text style={[styles.inerText, { color: "cyan" }]}>K</Text>
                  <Text style={[styles.inerText, { color: "red" }]}>e</Text>
                  <Text style={[styles.inerText, { color: "blue" }]}>n</Text>
                  <Text style={[styles.inerText, { color: "yellow" }]}>X</Text>
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
                    {/* <Image source={require('../../images/user.png')} style={styles.userImg} /> */}
                    <IconUser name="user-o" color="white" size={24} />
                  </View>
                  <View style={{ flex: 4.1 }}>
                    <TextInput
                      onChangeText={(value) => this.setState({ name: value })}
                      underlineColorAndroid="transparent"
                      placeholder={data.main_screen.name_placeholder}
                      placeholderTextColor="white"
                      underlineColorAndroid="transparent"
                      autoCorrect={true}
                      autoFocus={false}
                      keyboardAppearance="default"
                      keyboardType="default"
                      style={[
                        styles.inputTxt,
                        { textAlign: I18nManager.isRTL ? "right" : "left" },
                      ]}
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
                    {/* <Image source={require('../../images/mail.png')} style={styles.mail} /> */}
                    <Icon name="mail" color="white" size={24} />
                  </View>
                  <View style={{ flex: 4.1 }}>
                    <TextInput
                      onChangeText={(value) => this.setState({ email: value })}
                      underlineColorAndroid="transparent"
                      placeholder={data.main_screen.email_placeholder}
                      placeholderTextColor="white"
                      autoCapitalize="none"
                      keyboardType="email-address"
                      underlineColorAndroid="transparent"
                      autoCorrect={true}
                      style={[
                        styles.inputTxt,
                        { textAlign: I18nManager.isRTL ? "right" : "left" },
                      ]}
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
                      secureTextEntry={true}
                      placeholderTextColor="white"
                      underlineColorAndroid="transparent"
                      autoCorrect={false}
                      style={[
                        styles.inputTxt,
                        { textAlign: I18nManager.isRTL ? "right" : "left" },
                      ]}
                    />
                  </View>
                </View>
                <TouchableOpacity
                  style={[
                    styles.signUpBtn,
                    { backgroundColor: orderStore.settings.data.main_clr },
                  ]}
                  onPress={() => this.register()}
                >
                  <Text style={styles.signUpTxt}>
                    {data.main_screen.sign_up}
                  </Text>
                </TouchableOpacity>
                {/* <View style={styles.fgBtn}>
                  {
                    data.registerBtn_show.facebook ?
                      <TouchableOpacity style={styles.buttonCon}
                        onPress={() => { this.fbLogin() }} >
                        <Text style={styles.socialBtnText}>{data.main_screen.fb_btn}</Text>
                      </TouchableOpacity>
                      :
                      null
                  }
                  {
                    data.registerBtn_show.google && data.registerBtn_show.facebook ?
                      <Text style={styles.orTxt}>{data.main_screen.separator}</Text>
                      :
                      null
                  }
                  {
                    data.registerBtn_show.google ?
                      <TouchableOpacity style={[styles.buttonCon, { backgroundColor: '#DB4437' }]}
                        onPress={() => { this.handleGoogleSignIn() }} >
                        <Text style={styles.socialBtnText}>{data.main_screen.g_btn}</Text>
                      </TouchableOpacity>
                      :
                      null
                  }
                </View> */}

                {/* <View style={{marginTop:wp('2')}}>
                {SignInWithAppleButton(styles.appleBtn, this.appleSignIn)}
              </View> */}

                {/* <View style={styles.fgBtn}>
               

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
                <Text style={styles.expTxt}>
                  {data.main_screen.already_account}{" "}
                </Text>
                <Text
                  style={styles.signUpT}
                  onPress={() => this.props.navigation.navigate("SignIn")}
                >
                  {data.main_screen.sign_in}
                </Text>
              </View>
            </KeyboardAvoidingView>
          </ImageBackground>
        </ImageBackground>
      </View>
    );
  }
}
