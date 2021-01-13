import React, { Component } from 'react';
import {
  Text, View, Image, TouchableOpacity, ScrollView, Linking, Platform
} from 'react-native';
import {
  AdMobBanner,
  AdMobInterstitial,
  PublisherBanner,
  AdMobRewarded,
} from 'react-native-admob';
import Modal from "react-native-modal";
import call from 'react-native-phone-call';
import { width, height, totalSize } from 'react-native-dimension';
import Accordion from 'react-native-collapsible/Accordion';
import { Avatar, Icon } from 'react-native-elements';
import CountDown from 'react-native-countdown-component';
import ProgressImage from '../CustomTags/ImageTag';
import ImageViewer from 'react-native-image-zoom-viewer';
import HTMLView from 'react-native-htmlview';
import * as Animatable from 'react-native-animatable';
import { COLOR_PRIMARY, COLOR_ORANGE, COLOR_GRAY, COLOR_SECONDARY, S14 } from '../../../styles/common';
import { observer } from 'mobx-react';
import Store from '../../Stores';
import store from '../../Stores/orderStore';
import Claim from './Claim'
import Report from './Report'
import styles from '../../../styles/DescriptionStyleSheet';
import FeatureDetail from './FeatureDetail';
import { withNavigation } from 'react-navigation';
const SECTIONS = [
  {
    title: 'First',
    content: [{ name: "Hotels" }, { name: "Hotels" }, { name: "Hotels" }, { name: "Hotels" }, { name: "Hotels" }],
  },
];
class Description extends Component<Props> {
  constructor(props) {
    super(props);
    this.state = {
      getCoupon: false,
      reportModel: false,
      modalVisible: false,
      isClaimVisible: false,
      images: [],
      index: 0,
      timer: 0,
      web: false,
    }
  }
  static navigationOptions = {
    header: null
  };
  componentDidMount = async() => {
    await this.interstitial() 
  }
  interstitial = () => {        
    let data = store.settings.data;
    try {
      if ( data.has_admob && data.admob.interstitial !== '' ) {
         AdMobInterstitial.setAdUnitID(data.admob.interstitial); //ca-app-pub-3940256099942544/1033173712
         AdMobInterstitial.requestAd().then(() => AdMobInterstitial.showAd()); 
      }
    // InterstitialAdManager.showAd('636005723573957_636012803573249')
    //   .then(didClick => console.log('response===>>>',didClick))
    //   .catch(error => console.log('error===>>>',error)); 
    } catch (error) {
        console.log('catch===>>>',error);
    }
 }
  componentWillMount = async () => {
    let { orderStore } = Store;
    let data = orderStore.home.FEATURE_DETAIL.data.listing_detial;
    // CountDown func call
    await this.countDown(data.coupon_details.expiry_date)
    if (data.has_gallery) {
      for (let i = 0; i < data.gallery_images.length; i++) {
        await this.state.images.push({ url: data.gallery_images[i].url })
      }
    }
    // console.log('iamges=', this.state.images);
  }
  call = (number) => {
    const args = {
      number: number, // String value with the number to call
      prompt: false // Optional boolean property. Determines if the user should be prompt prior to the call 
    }

    call(args).catch(console.error)
  }
  webSite = (url) => {
    if (url !== "") {
      Linking.openURL(url);
    }
  }
  setModalVisible = (state, prop) => {
    if (state === 'claim' && prop === false) {
      this.setState({ reportModel: false, isClaimVisible: true })
    } else {
      if (state === 'report') {
        this.setState({ reportModel: true, isClaimVisible: false })
      }
    }
  }
  hideModels = (state, hide) => {
    if (state === 'claim') {
      this.setState({ isClaimVisible: hide, reportModel: hide })
    } else {
      if (state === 'report') {
        this.setState({ reportModel: hide, reportModel: hide })
      }
    }
  }
  getDirection = async () => {
    data = store.home.FEATURE_DETAIL.data.listing_detial;
    if (Platform.OS === 'android') {
      var url = "geo:"+data.location.latt+","+data.location.long;
    } else {
      var url = "http://maps.apple.com/?ll="+data.location.latt+","+data.location.long;
    }
    Linking.canOpenURL(url)
      .then((supported) => {
        if (!supported) {
          console.log("Can't handle url: " + url);
        } else {
          return Linking.openURL(url);
        }
      })
      .catch((err) => console.error('An error occurred', err));
  }
  countDown(eventDate) {
    var eventDate = new Date(eventDate);
    var currentDate = new Date();
    var differenceTravel = eventDate.getTime() - currentDate.getTime();
    var seconds = Math.floor((differenceTravel) / (1000));
    this.setState({ timer: seconds })
  }
  _renderHeader = (section, isActive) => {
    let { orderStore } = Store;
    let data = orderStore.home.FEATURE_DETAIL.data.listing_detial;
    return (
      <View style={[styles.labelCon, { borderBottomWidth: 0 }]}>
        <Animatable.View
          duration={1000}
          animation="tada"
          easing="ease-out"
          iterationCount={'infinite'}
          direction="alternate">
          <Image source={require('../../images/clock.png')} style={styles.labelIcon} />
        </Animatable.View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-start' }}>
          <Text style={[styles.timeTxt, { color: data.color_code }]}>{data.business_hours_status}</Text>
        </View>
        <Image source={(isActive ? require('../../images/dropDown.png') : require('../../images/next.png'))} style={styles.dropDownIcon} />
      </View>
    );
  }
  _renderContent = (section, content) => {
    let { orderStore } = Store;
    let data = orderStore.home.FEATURE_DETAIL.data.listing_detial;
    return (
      <View style={styles.renderCon}>
        {
          data.listing_hours.map((item, key) => {
            return (
              <View key={key} style={styles.renderStrip}>
                <View style={styles.stripDay}>
                  {item.current_day !== true ? <Text style={styles.renderDayTxt}>{item.day_name}</Text> : <Text style={[styles.renderDayTxt, { color: '#32cb55', fontWeight: 'bold' }]}>{item.day_name}</Text>}
                </View>
                <View style={styles.stripTime}>
                  {item.current_day !== true ? <Text style={styles.renderTimeTxt}>{item.is_closed === true ? "closed" : item.timingz}</Text> : <Text style={[styles.renderTimeTxt, { color: '#32cb55', fontWeight: 'bold' }]}>{item.is_closed === true ? "closed" : item.timingz}</Text>}
                </View>
              </View>
            );
          })
        }
      </View>
    );
  }
  render() {
    let { orderStore } = Store;
    let data = orderStore.home.FEATURE_DETAIL.data.listing_detial;
    var auth_img = data.listing_author_dp;
    var main_clr = store.settings.data.main_clr;
    return (
      <View style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <FeatureDetail callModel={this.setModalVisible} />
          {
            data.is_pending ?
              <View style={{ height: height(12), flexDirection: 'row', width: width(100), marginBottom: 10, alignItems: 'center', backgroundColor: '#e3f8f5', alignSelf: 'center' }}>
                {/* <Image source={require('../../images/profileWarning.png')} style={{ height: height(7), width: width(15), resizeMode: 'contain', marginHorizontal: 20 }} /> */}
                <Icon
                  size={36}
                  name='warning'
                  type='antdesign'
                  color='#3bbeb0'
                  containerStyle={{ marginLeft: 20, marginRight: 10, marginVertical: 0 }}
                />
                <Text style={{ fontSize: totalSize(2), color: COLOR_SECONDARY }}>{data.pending_txt}</Text>
              </View>
              :
              null
          }
          {
            data.has_gallery === false ? null :
              <View style={styles.listCon}>
                {
                  data.gallery_images.map((item, key) => {
                    return (
                      <TouchableOpacity key={key} style={styles.flatlistChild} onPress={() => { this.setState({ modalVisible: true, index: key }) }} >
                        <ProgressImage source={{ uri: item.small_img }} style={styles.childImg} />
                      </TouchableOpacity>
                    );
                  })
                }
              </View>
          }
          {
            data.street_address.length > 0 ?
              <TouchableOpacity style={styles.labelCon} onPress={() => this.getDirection()}>
                <Image source={require('../../images/address.png')} style={styles.labelIcon} />
                <View style={styles.labeTxtCon}>
                  <Text style={styles.labelTxt}>{data.street_address}</Text>
                </View>
              </TouchableOpacity>
              : null
          }
          {
            data.contact_no.length > 0 ?
              <TouchableOpacity style={styles.labelCon} onPress={() => this.call(data.contact_no)}>
                <Image source={require('../../images/call.png')} style={styles.labelIcon} />
                <View style={styles.labeTxtCon}>
                  <Text style={styles.labelTxt}>{data.contact_no}</Text>
                </View>
              </TouchableOpacity>
              : null
          }
          {
            data.web_url.length > 0 ?
              <TouchableOpacity style={styles.labelCon} onPress={() => this.webSite(data.web_url)}>
                <Image source={require('../../images/global.png')} style={styles.labelIcon} />
                <View style={styles.labeTxtCon}>
                  <Text style={styles.labelTxt}>{data.view_website}</Text>
                </View>
              </TouchableOpacity>
              : null
          }
          {
            data.pricing.length > 0 ?
              <View style={styles.labelCon}>
                <Image source={require('../../images/dollar.png')} style={styles.labelIcon} />
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-start' }}>
                  <Text style={styles.priceTxt}>{data.pricing_txt}</Text>
                </View>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-end' }}>
                  <Text style={styles.dollarTxt}>{data.pricing}</Text>
                </View>
              </View>
              : null
          }
          {
            data.is_hours_allowed ?
              <Accordion
                sections={SECTIONS}
                collapsed={false}
                renderHeader={this._renderHeader}
                renderContent={this._renderContent}
                disabled={!data.show_all_days}
                containerStyle={{ alignSelf: 'center' }}
              />
              :
              null
          }
          {!data.listing_has_coupon ? null :
            <View style={styles.dealBox}>
              <View style={styles.cuponBtnCon}>
                <TouchableOpacity style={[styles.cuponBtn, { backgroundColor: main_clr }]} onPress={() => this.setState({ getCoupon: true })}>
                  <Text style={styles.cuponBtnTxt}>{data.coupon_details.btn_txt}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.expCon}>
                <Text style={styles.expTxt}>{data.coupon_details.expiry_txt}</Text>
                <View style={styles.expTimeCon}>
                  <CountDown
                    until={this.state.timer}
                    digitTxtColor={COLOR_PRIMARY}
                    timeTxtColor='#000000'
                    digitBgColor={main_clr}
                    timeToShow={['D', 'H', 'M', 'S']}
                    label={'Days' / 'Hours' / 'Minutes' / 'Seconds'}
                    // onFinish={() => alert('Deal Expired')}
                    // onPress={() => alert('Deal Not Expired')}
                    size={15}
                  />
                </View>
              </View>
            </View>
          }
          <View style={styles.profileCon}>
            <View style={styles.imgCon}>
              <Avatar
                size="medium"
                rounded
                source={{ uri: auth_img }}
                activeOpacity={1}
              />
            </View>
            <View style={{ flex: 1, justifyContent: 'center' }}>
              <Text style={styles.autherText}>{data.listing_author_name}</Text>
              <Text style={[styles.autherText, { fontSize: totalSize(S14) }]}>{data.listing_author_location}</Text>
            </View>
            <View style={styles.viewBtn}>
              <TouchableOpacity style={[styles.viewBtnCon, { backgroundColor: main_clr }]} onPress={() => this.props.navigation.push('PublicProfileTab', { profiler_id: data.listing_author_id, user_name: data.listing_author_name })}>
                <Text style={styles.viewBtnText}>{data.view_profile}</Text>
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.titleTxt}>{data.desc.tab_txt}</Text>
          <View style={{ width: width(88), alignSelf: 'center', marginHorizontal: 15, marginBottom: 10, justifyContent: 'center' }} >
            <HTMLView
              value={data.desc.tab_desc}
              stylesheet={styles.longTxt}
            />
          </View>
        </ScrollView>
        <Modal
          animationInTiming={200}
          animationOutTiming={100}
          animationIn="slideInLeft"
          animationOut="slideOutRight"
          avoidKeyboard={true}
          transparent={true}
          isVisible={this.state.getCoupon}
          onBackdropPress={() => this.setState({ getCoupon: false })}
          style={{ flex: 1 }}>
          <View style={{ height: height(40), width: width(90), alignSelf: 'center', backgroundColor: COLOR_PRIMARY }}>
            <View style={{ flex: 1 }}>
              <View style={{ height: height(4), alignItems: 'flex-end' }}>
                <TouchableOpacity style={{ elevation: 3, height: height(3.5), width: width(6), justifyContent: 'center', alignItems: 'center', backgroundColor: main_clr }} onPress={() => { this.setState({ getCoupon: false }) }}>
                  <Image source={require('../../images/clear-button.png')} style={{ height: height(2), width: width(3), resizeMode: 'contain' }} />
                </TouchableOpacity>
              </View>
              <View style={{ alignItems: 'center', marginVertical: 5 }}>
                <Text style={{ fontSize: totalSize(1.7), color: 'black', marginTop: 0, fontWeight: 'bold' }}>{data.coupon_details.title}</Text>
                <Text style={{ fontSize: totalSize(1.5), color: 'gray', textAlign: 'center', marginHorizontal: 10, marginVertical: 5, }}>{data.coupon_details.desc}</Text>
                <Text style={{ fontSize: totalSize(1.6), color: 'black' }}>{data.coupon_details.coupon_txt}</Text>
              </View>
              <Text selectable={true} style={{ height: height(6), marginHorizontal: 20, padding: 10, marginVertical: 5, textAlign: 'center', borderStyle: 'dashed', borderRadius: 5, borderWidth: 1, borderColor: 'red', backgroundColor: COLOR_PRIMARY, color: COLOR_SECONDARY, fontSize: totalSize(1.6) }}>{data.coupon_details.coupon_code}</Text>
              <Text style={{ fontSize: totalSize(1.5), color: 'gray', marginVertical: 5, alignSelf: 'center' }}>{data.coupon_details.click_to_copy}</Text>
              <Text style={{ fontSize: totalSize(1.5), color: 'gray', marginVertical: 5, alignSelf: 'center' }}>{data.coupon_details.validity_txt} {data.coupon_details.valid_till}</Text>
              {/* <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center' }}>
                <Text style={{ fontSize: totalSize(1.5), color: 'black', marginVertical: 5, alignSelf: 'center' }}>Note: </Text>
                <Text style={{ fontSize: totalSize(1.5), color: 'gray', marginVertical: 5, alignSelf: 'center' }}>{ data.coupon_details.click_to_copy }</Text>
              </View> */}
            </View>
            <TouchableOpacity style={{ elevation: 3, height: height(6), justifyContent: 'center', alignItems: 'center', backgroundColor: main_clr }} onPress={() => { this.setState({ reportModel: false }), this.webSite(data.coupon_details.referal_link) }}>
              <Text style={{ fontSize: totalSize(1.8), color: COLOR_PRIMARY, fontWeight: 'bold' }}>{data.coupon_details.referal_btn_txt}</Text>
            </TouchableOpacity>
          </View>
        </Modal>
        <Modal
          animationInTiming={500}
          animationIn="slideInLeft"
          animationOut="slideOutRight"
          avoidKeyboard={true}
          // transparent={false}
          isVisible={this.state.reportModel}
          onBackdropPress={() => this.setState({ reportModel: false })}
          style={{ flex: 1 }}>
          <Report hideModels={this.hideModels} />
        </Modal>
        <Modal
          animationInTiming={500}
          animationIn="slideInLeft"
          animationOut="slideOutRight"
          avoidKeyboard={true}
          // transparent={false}
          isVisible={this.state.isClaimVisible}
          onBackdropPress={() => this.setState({ isClaimVisible: false })}
          style={{ flex: 1 }}>
          <Claim hideModels={this.hideModels} />
        </Modal>
        <Modal
          visible={this.state.modalVisible}
          transparent={true}
          style={{ flex: 1 }}
          onRequestClose={() => this.setState({ modalVisible: false })}
        >
          <ImageViewer
            imageUrls={this.state.images}
            index={this.state.index}
            pageAnimateTime={500}
            backgroundColor='black'
            transparent={false}
            enablePreload={true}
            style={{ flex: 1, backgroundColor: 'black' }}
            footerContainerStyle={{ marginHorizontal: 0, marginVertical: 0 }}
            onDoubleClick={() => {
              this.setState({ modalVisible: false })
            }}
            onSwipeDown={() => {
              this.setState({ modalVisible: false })
              // console.log('onSwipeDown');
            }}
            enableSwipeDown={true}
          />
        </Modal>
      </View>
    );
  }
}
export default withNavigation(Description)
