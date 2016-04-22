/**
 * Created by Mars on 2016/3/30.
 */

'use strict';
import React,{Navigator,View,Text,TouchableOpacity,StyleSheet,Animated,PropTypes} from 'react-native'

export class AlertDialog{

  canDialogView:CanDialogView;
  component;
  props;
  constructor(props){
    this.props = props;
  }

  show(canDialogView:CanDialogView) {
    canDialogView.showDialog(this);
  }

  dismiss(canDialogView:CanDialogView) {
    canDialogView.dismissDialog();
  }

  onDismiss(){

  }
  
  render(){
    return <this.component {...this.props}></this.component>;
  }

}

export class ModalDialog extends AlertDialog {
  constructor(props){
    super(props);
    this.props = props;
  }
  dismiss(canDialogView:CanDialogView) {

  }

  dismissModal() {
    this.canDialogView.dismissDialog();
  }
}

class EmptyDialog extends AlertDialog {
  render() {
    return (
      <View style={{alignSelf:'center',backgroundColor:'#8cddae'}}>
        <Text>you not give a dialog to show</Text>
      </View>
    );
  }
}

export class BottomDialog extends AlertDialog {
  translateDuration = 300;
  translating = false;
  constructor(props) {
    super(props);
    this.state = {
      translateY: new Animated.Value(300)
    };
    this.state.translateY.addListener((v)=>{
      if (v.value == 0){
        this.translating = false;
      }
    });
  }

  onLayout(evt) {
    var height = evt.nativeEvent.layout.height;
  }

  renderContent() {
    return (<View></View>);
  }

  onDismiss(){
    this.translateDismiss();
  }

  translateShow(){
    Animated.timing(
      this.state.translateY,
      {
        toValue: 0,
        duration: this.translateDuration
      }
    ).start();
  }

  translateDismiss(){
    Animated.timing(
      this.state.translateY,
      {
        toValue: 300,
        duration: this.translateDuration
      }
    ).start();
  }

  render() {
    if (!this.translating){
      this.translateShow();
    }
    return (
      <Animated.View
        onLayout={(evt)=>{this.onLayout(evt)}}
        style={[{position:'absolute',left:0,right:0,bottom:0,transform:[{translateY:this.state.translateY}]}]}>
        {this.renderContent()}
      </Animated.View>
    );
  }
}

export class CanDialogView extends React.Component {
  dialog:AlertDialog;
  fadeDuration = 200;
  coverOpacity = 0.8;

  constructor(props) {
    super(props);
    this.state = {
      showDialog: false,
      fadeIn: new Animated.Value(0)
    };

    if (this.props.coverOpacity) {
      this.coverOpacity = this.props.coverOpacity;
    }
  }

  showDialog(dialog:AlertDialog) {
    if (dialog) {
      this.dialog = dialog;
      if (this.dialog instanceof ModalDialog) {
        this.dialog.canDialogView = this;
      }
    } else {
      this.dialog = new EmptyDialog();
    }
    dialog.canDialogView = this;
    this.setState({
      showDialog: true
    });

    Animated.timing(
      this.state.fadeIn,
      {
        toValue: this.coverOpacity,
        duration: this.fadeDuration,
      }
    ).start();
  }

  dismissDialog() {
    this.dialog.onDismiss();
    Animated.timing(
      this.state.fadeIn,
      {
        toValue: 0,
        duration: this.fadeDuration,
      }
    ).start(()=>{
      this.setState({
        showDialog: false
      });
    });

  }

  onOutSidePress() {
    this.dialog.dismiss(this);
  }

  render() {
    var outScreen = {left:2000};
    var coverStyle = [styles.cover,{opacity:this.state.fadeIn}];
    var dialogView;
    if (this.state.showDialog){
      dialogView = this.dialog.render();
    }else {
      coverStyle.push(outScreen);
    }
    return(<View style={{flex: 1}}>
      {this.props.children}
      <Animated.View
        style={coverStyle}
      >
        <TouchableOpacity style={{flex:1}} onPress={()=>{this.onOutSidePress()}}>
        </TouchableOpacity>
      </Animated.View>
      <View style={[{position: 'absolute', left: 0, top: 0, right: 0, bottom: 0}]}>
        {dialogView}
      </View>
    </View>);
  }
}

var styles = StyleSheet.create({
  cover: {
    position: 'absolute', left: 0, top: 0, right: 0, bottom: 0,
    backgroundColor: '#222222',
  }
});