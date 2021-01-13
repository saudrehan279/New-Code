import React, { Component } from "react";
import {
  Text,
  View,
  Image,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
import Store from "../../Stores";
import styles from "../../../styles/MainScreenStyle";
let { orderStore } = Store;
export default class MainScreen extends Component<Props> {
  constructor(props) {
    let { orderStore } = Store;
    let data = orderStore.settings.data;
    super(props);
  }
  static navigationOptions = { header: null };
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
            <View style={styles.logoView}>
              <Image source={{ uri: data.logo }} style={styles.logoImg} />
              <View style={styles.logoTxttop}>
                <Text style={[styles.inerText, { color: "yellow" }]}>A</Text>
                <Text style={[styles.inerText, { color: "limegreen" }]}>u</Text>
                <Text style={[styles.inerText, { color: "cyan" }]}>t</Text>
                <Text style={[styles.inerText, { color: "blue" }]}>i</Text>
                <Text style={[styles.inerText, { color: "yellow" }]}>s</Text>
                <Text style={[styles.inerText, { color: "limegreen" }]}>m</Text>
                <Text style={[styles.inerText, { color: "cyan" }]}>K</Text>
                <Text style={[styles.inerText, { color: "red" }]}>e</Text>
                <Text style={[styles.inerText, { color: "blue" }]}>n</Text>
                <Text style={[styles.inerText, { color: "yellow" }]}>X</Text>
                <Text style={[styles.inerText, { color: "limegreen" }]}>t</Text>
                <Text style={[styles.inerText, { color: "cyan" }]}>i</Text>
                <Text style={[styles.inerText, { color: "blue" }]}>o</Text>
                <Text style={[styles.inerText, { color: "limegreen" }]}>n</Text>
              </View>
              <Text style={styles.logoTxt}>
                Find professionals, join our Coummunity and Donate
              </Text>
            </View>
            <View style={styles.buttonView}>
              <TouchableOpacity
                style={styles.signInBtn}
                onPress={() => {
                  this.props.navigation.navigate("SignIn");
                }}
              >
                <Text style={styles.signTxt}>{data.main_screen.sign_in}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.signUpBtn,
                  { backgroundColor: orderStore.settings.data.main_clr },
                ]}
                onPress={() => {
                  this.props.navigation.navigate("SignUp");
                }}
              >
                <Text style={styles.signUpTxt}>{data.main_screen.sign_up}</Text>
              </TouchableOpacity>
            </View>
            <Text
              style={styles.expTxt}
              onPress={() => this.props.navigation.navigate("Drawer")}
            >
              {data.main_screen.explore}
            </Text>
          </ImageBackground>
        </ImageBackground>
      </View>
    );
  }
}
