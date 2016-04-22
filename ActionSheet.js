/**
 * Created by Mars on 2016/3/30.
 */
import React,{Navigator,View,Text,TouchableHighlight,StyleSheet,Animated,PropTypes} from 'react-native'
import {BottomDialog} from './Dialog'

export class Button extends React.Component {
  render() {
    var children;
    if (this.props.children) {
      children = this.props.children;
    } else {
      children = (<Text></Text>);
    }
    return (<TouchableHighlight
        {...this.props}
        underlayColor='#eeeeee'
        onPress={()=>{
        if (this.props.onPress){
          this.props.onPress();
        }
        }}>
        <View>
          {children}
        </View>
      </TouchableHighlight>
    );
  }
}

export default class ActionSheet extends BottomDialog {
  constructor(props){
    super(props);
    this.props = props;
  }
  _onCancel(){
    this.dismiss(this.canDialogView);
  }

  renderContent() {
    var children = this.children;
    if(!children){
      children = (<View></View>);
    }
    return (<View {...this.props}>
        {children}
        <Button style={styles.cancelBtnView}  onPress={()=>{this._onCancel()}}>
          <Text style={styles.cancelBtnText}>取消</Text>
        </Button>
      </View>
    );
  }
}

var styles = StyleSheet.create({

  cancelBtnView:{
    height: 48,
    backgroundColor:'white',
    borderRadius:8,
    justifyContent:'center'
  },
  cancelBtnText:{
    color:'red',
    textAlign:'center',
  }
});