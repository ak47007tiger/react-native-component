/**
 * Created by Mars on 2016/4/12.
 */
'use strict';
import React ,{Dimensions,Animated,View,TouchableOpacity,Text,PropTypes,StyleSheet,ScrollView} from 'react-native'

const pageDayCount = 42;
const weeks = '日,一,二,三,四,五,六'.split(',');
const windowWidth = Dimensions.get('window').width;
const circleRadius = 2;
const circleD = circleRadius * 2;
const actions = {
  pre: 0,
  next: 1,
  none: 2
};
const view_actions = {
  pre_page:'pre_page',
  next_page:'next_page',
  update_pages_scheduled:'update_pages_scheduled',
  update_day_model:'update_day_model'
};
const events = {
  month_change:'month_change',
  day_selected:'day_selected'
};
const min_touch = 8;

class DayModel {
  year;
  month;
  day;
  selected:Boolean = false;
  scheduled:Boolean = false;

  static build(year, month, day, selected = false, scheduled = false) {
    var model = new DayModel();
    model.year = year;
    model.month = month;
    model.day = day;
    model.selected = selected;
    model.scheduled = scheduled;
    return model;
  }
  static build0(date:Date){
    var model = new DayModel();
    model.year = date.getFullYear();
    model.month = date.getMonth();
    model.day = date.getDate();
    return model;
  }
  toString(){
    return `${this.year}-${this.month}-${this.day}-${this.scheduled}`;
  }
}

class CalendarModel{
  pagesModels:Array<Array> = [];
  keyToDayModel:Map<String,DayModel> = new Map();
  todayDate:Date;
  calendarDate:Date;
  lastScheduledDates = [];
  constructor(){
    this.todayDate = new Date();
    this.calendarDate = new Date();
  }
  dayCountOfMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  }

  dayOfWeek(year, month, day) {
    return new Date(year, month, day).getDay();
  }

  setCalendarDate(date:Date){
    this.calendarDate = date;
    this.updatePagesModels(this.calendarDate);
  }

  updatePageDays(pageDays:Array<DayModel>,year,month){
    var pageDate = new Date(year, month - 1, 1);
    var firstDayOfWeek = this.dayOfWeek(year, month, 1);
    var preMonthDayStartIndex;
    var dayCountOfMonth = this.dayCountOfMonth(year,pageDate.getMonth());
    if (0 == firstDayOfWeek) {
      preMonthDayStartIndex = dayCountOfMonth - 7;
    } else {
      preMonthDayStartIndex = dayCountOfMonth - firstDayOfWeek;
    }
    pageDate.setDate(preMonthDayStartIndex);
    for (var i = 0; i < 42; i++){
      pageDate.setDate(pageDate.getDate() + 1);
      var dayModel:DayModel = pageDays[i];
      dayModel.year = pageDate.getFullYear();
      dayModel.month = pageDate.getMonth();
      dayModel.day = pageDate.getDate();
      var key = this.dayModelToKey(dayModel);
      if (this.keyToDayModel.has(key)){
        var first = this.keyToDayModel.get(key);
        this.keyToDayModel.set(key,[first,dayModel]);
      }else {
        this.keyToDayModel.set(key,dayModel);
      }
    }
    return pageDays;
  }

  buildPageDays(){
    var pageDays:Array<DayModel> = new Array();
    for (var i = 0; i < 42; i++){
      pageDays[i] = new DayModel();
    }
    return pageDays;
  }

  dayModelToKey(dayModel:DayModel){
    return `${dayModel.year}${dayModel.month}${dayModel.day}`;
  }

  dateToKey(date:Date){
    return `${date.getFullYear()}${date.getMonth()}${date.getDate()}`;
  }

  notScheduledAll(){
    calendarModel.pagesModels.forEach((models:Array)=>{
      models.forEach((model:DayModel)=>{
        model.scheduled = false;
      });
    });
  }

  reScheduled(){
    this.updatePagesScheduled(this.lastScheduledDates);
  }

  updatePagesScheduled(scheduledDates:Array<Date>){
    this.lastScheduledDates = scheduledDates;
    /*scheduledDates.forEach((date:Date)=>{
      calendarModel.pagesModels.forEach((models:Array)=>{
        models.forEach((model:DayModel)=>{
          if(this.dayModelToKey(model) == this.dateToKey(date)){
            model.scheduled = true;
          }
        });
      });
    });*/
    scheduledDates.forEach((date:Date)=>{
      var dayModel = this.keyToDayModel.get(this.dateToKey(date));
      if (dayModel){
        if (dayModel instanceof Array){
          dayModel[0].scheduled = true;
          dayModel[1].scheduled = true;
        }else {
          dayModel.scheduled = true;
        }
      }
    });
  }

  updatePagesModels(date:Date){
    calendarModel.keyToDayModel.clear();
    var tempDate = new Date(date.getFullYear(),date.getMonth() - 1,1);
    this.pagesModels[0] = this.updatePageDays(this.pagesModels[0],tempDate.getFullYear(),tempDate.getMonth());

    this.pagesModels[1] = this.updatePageDays(this.pagesModels[1],date.getFullYear(),date.getMonth());

    tempDate = new Date(date.getFullYear(),date.getMonth() + 1,1);
    this.pagesModels[2] = this.updatePageDays(this.pagesModels[2],tempDate.getFullYear(),tempDate.getMonth());
  }

  buildPagesModels(){
    this.pagesModels[0] = this.buildPageDays();
    this.pagesModels[1] = this.buildPageDays();
    this.pagesModels[2] = this.buildPageDays();
  }

  getDayModel(page,index):DayModel{
    return calendarModel.pagesModels[page][index];
  }
}

var calendarModel:CalendarModel = new CalendarModel();

class CalendarPresenter{
  calendarView:CalendarView;
  lastSelectedItemView:ItemView;
  constructor(){
  }

  selectItem(itemView:ItemView){
    if (this.lastSelectedItemView){
      calendarModel
        .getDayModel(this.lastSelectedItemView.page,this.lastSelectedItemView.index)
        .selected = false;
      this.lastSelectedItemView.updateView();
    }
    this.lastSelectedItemView = itemView;
    var dayModel = calendarModel.getDayModel(itemView.page,itemView.index);
    dayModel.selected = true;
    this.lastSelectedItemView.updateView();
  }

  isToday(dayModel:DayModel){
    var today:Date = calendarModel.todayDate;
    return (dayModel.year == today.getFullYear()
    && dayModel.month == today.getMonth() && dayModel.day == today.getDate());
  }

  inShowMonth(dayModel:DayModel,page,index){
    var dayModelAtIndex8 = calendarModel.getDayModel(page,8);
    return dayModel.month == dayModelAtIndex8.month;
  }
}

var calendarPresenter:CalendarPresenter = new CalendarPresenter();

export default class CalendarView extends React.Component{
  static propTypes = {
    onDaySelect: PropTypes.func,
    width: PropTypes.number,
    height: PropTypes.number,
    itemHeight: PropTypes.number,
    onMonthChange:PropTypes.func,
  };
  pages:Array = [];
  lastPageX;
  width = windowWidth;
  height;
  contentTx;
  action = actions.none;
  itemViewWidth;
  itemViewHeight = 34;
  weekViewHeight = this.itemViewHeight * 1.3;

  constructor(props){
    super(props);

    const funcNames = [
      'onStartShouldSetResponder',
      'onMoveShouldSetResponder',
      'onResponderGrant',
      'onResponderMove',
      'onResponderTerminationRequest',

      'onMonthChange',
      'onDaySelect',

      'updateView',
      'updatePagesScheduled',
      'renderPage'
    ];
    funcNames.forEach((name)=> {
      this[name] = this[name].bind(this);
    });

    if (props.width) {
      this.width = props.width;
    }
    this.itemViewWidth = Math.floor(this.width / 7);
    if (props.height){
      this.height = props.height;
    }else {
      this.height = this.weekViewHeight + 6 * this.itemViewHeight + 16;
    }

    calendarPresenter.calendarView = this;
    calendarModel.buildPagesModels();
    calendarModel.updatePagesModels(calendarModel.calendarDate);
    this.buildPages();

    this.state = {
      rightCardTx: new Animated.Value(0),
    };
  }

  buildPages() {
    this.pages[0] = this.renderPage(0);
    this.pages[1] = this.renderPage(1);
    this.pages[2] = this.renderPage(2);
  }

  updatePages(lastShowMonth,month){
    //update pre
    if (lastShowMonth < month){
      this.pages[2] = this.pages[1];
      this.pages[1] = this.pages[0];
      this.pages[0] = this.renderPage(0);
    }else {//update next
      this.pages[0] = this.pages[1];
      this.pages[1] = this.pages[2];
      this.pages[2] = this.renderPage(2);
    }
  }

  onMonthChange(month){
    var lastShowMonth = calendarModel.calendarDate.getMonth();
    calendarModel.setCalendarDate(new Date(calendarModel.calendarDate.getFullYear(), month, 1));
    calendarModel.notScheduledAll();
    calendarModel.reScheduled();
    this.updatePages(lastShowMonth,month);
    // this.buildPages();
    if (this.props.onMonthChange){
      this.props.onMonthChange(calendarModel.calendarDate);
    }
  }

  onDaySelect(page,index){
    if (this.props.onDaySelect){
      var dayModel:DayModel = calendarModel.pagesModels[page][index];
      this.props.onDaySelect(dayModel.year,dayModel.month,dayModel.day);
    }
  }

  onStartShouldSetResponder(evt) {
    return true;
  }

  onMoveShouldSetResponder(evt) {
    return true;
  }

  onResponderGrant(evt) {
    this.lastPageX = evt.nativeEvent.pageX;
  }

  onResponderMove(evt) {
    var dx = evt.nativeEvent.pageX - this.lastPageX;
    if (Math.abs(dx) - min_touch < 0){
      return;
    }
    switch (this.action) {
      case actions.pre:
        return;
      case actions.next:
        return;
      case actions.none:
        if (dx < 0) {
          this.action = actions.next;
          this.showNext();
        }
        if (dx > 0) {
          this.action = actions.pre;
          this.showPre();
        }
        break;
    }
  }

  onResponderTerminationRequest(evt) {
    return true;
  }

  showPre() {
    Animated.timing(
      this.state.rightCardTx, {
        toValue: this.width
      }
    ).start(()=>{
      this.onMonthChange(calendarModel.calendarDate.getMonth() - 1);
      this.resetTranslate();
      this.updateView();
      this.action = actions.none;
    });
  }

  showNext() {
    Animated.timing(
      this.state.rightCardTx, {
        toValue: -this.width
      }
    ).start(()=>{
      this.onMonthChange(calendarModel.calendarDate.getMonth() + 1)
      this.resetTranslate();
      this.updateView();
      this.action = actions.none;
    });
  }

  resetTranslate(){
    this.contentTx = 0;
    this.state.rightCardTx.setValue(0);
  }

  updateView(){
    this.setState({});
  }

  updatePagesScheduled(scheduledDates:Array<Date>){
    calendarModel.updatePagesScheduled(scheduledDates);
    console.log('updatePagesScheduled');
    this.buildPages();
    this.updateView();
  }

  renderPage(page){
    var pageModels:Array<DayModel> = calendarModel.pagesModels[page];
    var items = [];
    for(var i = 0; i < pageModels.length; i++){
      items.push((<ItemView
        key={i}
        page={page}
        index={i}
        width={this.itemViewWidth}
        height={this.itemViewHeight}
        onSelected={this.onDaySelect}
      />));
    }
    return (<View style={[{flexDirection:'row',flexWrap:'wrap',width:this.width,marginTop:4}]}>
      {items}
    </View>);
  }

  getPageFirstDate():Date{
    var dayModel:DayModel = calendarModel.getDayModel(1,0);
    return new Date(dayModel.year,dayModel.month,dayModel.day);
  }

  getPageLastDate():Date{
    var dayModel:DayModel = calendarModel.getDayModel(1,41);
    return new Date(dayModel.year,dayModel.month,dayModel.day);
  }

  render(){
    return (
      <View style={{height:this.height,borderColor:'#aaaaaaa0',borderBottomWidth:1,backgroundColor:'white'}}>
        <WeekView width={this.width} height={this.weekViewHeight}/>
        <View style={styles.weekAndDaySplit}/>
        <View
          style={[{width:this.width,flex:1,marginTop:4}]}
          onStartShouldSetResponder={this.onStartShouldSetResponder}
          onMoveShouldSetResponder={this.onMoveShouldSetResponder}
          onResponderGrant={this.onResponderGrant}
          onResponderMove={this.onResponderMove}
          onResponderTerminationRequest={this.onResponderTerminationRequest}
        >
          <Animated.View
            ref={(v)=>{}}
            style={[
            {backgroundColor:'white',position:'absolute',left:-this.width,top:0,right:this.width,bottom:0},
            {transform:[{translateX:this.state.rightCardTx}]}]}>
            {this.pages[0]}
          </Animated.View>
          <Animated.View
            ref={(v)=>{}}
            style={[
            {backgroundColor:'white',position:'absolute',left:0,top:0,right:0,bottom:0},
            {transform:[{translateX:this.state.rightCardTx}]}]}>
            {this.pages[1]}
          </Animated.View>
          <Animated.View
            ref={(v)=>{}}
            style={[
            {backgroundColor:'white',position:'absolute',left:this.width,top:0,right:-this.width,bottom:0},
            {transform:[{translateX:this.state.rightCardTx}]}]}>
            {this.pages[2]}
          </Animated.View>
        </View>
      </View>);
  }
}

class ItemView extends React.Component{
  static propTypes = {
    onSelected:PropTypes.func,
    page:PropTypes.number.isRequired,
    index:PropTypes.number.isRequired,
    width:PropTypes.number.isRequired,
    height:PropTypes.number.isRequired
  };
  page;
  index;
  width;
  height;
  constructor(props){
    super(props);
    this.page = props.page;
    this.index = props.index;
    this.width = props.width;
    this.height = props.height;
    this.onPress = this.onPress.bind(this);
    this.updateView = this.updateView.bind(this);
  }

  onPress(){
    var dayModel = calendarModel.getDayModel(this.page,this.index);
    if (dayModel.scheduled){
      calendarPresenter.selectItem(this);
      if (this.props.onSelected){
        this.props.onSelected(this.page,this.index);
      }
    }
  }

  render(){
    var dayModel = calendarModel.pagesModels[this.page][this.index];
    return <TouchableOpacity
      activeOpacity={1}
      style={{alignItems:'center',width:this.width,height:this.height}}
      onPress={this.onPress}>
      {this.renderContainer(dayModel)}
      {this.renderCircle(dayModel)}
    </TouchableOpacity>;
  }

  updateView(){
    this.setState({});
  }

  renderText(dayModel:DayModel){
    var textStyle = styles.curMonthDayText;
    if (dayModel.scheduled){
      textStyle = styles.scheduledText;
    }
    if (!calendarPresenter.inShowMonth(dayModel,this.page,this.index)) {
      textStyle = styles.otherMonthDayText;
    }
    if (dayModel.selected){
      textStyle = styles.selectedText;
    }
    return (<Text style={[textStyle]}>{dayModel.day}</Text>);
  }

  renderContainer(dayModel){
    var containerStyles = [{
      alignItems:'center',justifyContent:'center',
      width:this.height,height:this.height
    }];
    if (calendarPresenter.isToday(dayModel)){
      containerStyles.push(styles.todayItem);
    }
    if (dayModel.selected){
      containerStyles.push(styles.selectedItem);
    }
    return (<View style={containerStyles}>
      {this.renderText(dayModel)}
    </View>);
  }

  renderCircle(dayModel){
    if (dayModel.scheduled){
      var bgColor = '#406eae';
      if (!calendarPresenter.inShowMonth(dayModel,this.page,this.index)){
        bgColor = '#888888';
      }
      if (dayModel.selected){
        bgColor = 'white';
      }
      var leftOrRight = this.width / 2 - circleRadius;
      return <View style={[{backgroundColor:bgColor,
        position:'absolute',
        left: leftOrRight,right:leftOrRight,bottom:3,
        height:circleD,borderRadius:circleRadius}]}/>;
    }
  }
}

class WeekView extends React.Component {
  itemWidth;
  height;

  constructor(props) {
    super(props);
    this.itemWidth = props.width / 7;
    this.height = props.height;
    this.renderItem = this.renderItem.bind(this);
  }

  renderItem(i) {
    return ;
  }

  render() {
    var children = [];
    for (var i = 0; i < 7; i++){
      children.push((
        <Text
        key={i}
        style={[styles.weekText,{width:this.itemWidth}]}>
          {weeks[i]}
        </Text>)
      );
    }
    return (<View style={[styles.week,{height:this.height}]}>
      {children}
    </View>);
  }
}

var styles = StyleSheet.create({
  week: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: 'white',
    alignItems:'center',
  },
  weekText: {
    color: '#888888',
    textAlign: 'center',
    alignSelf:'center'
  },
  weekAndDaySplit: {
    marginLeft: 16,
    marginRight: 16,
    backgroundColor: '#aaaaaaa0',
    height: 1
  },
  curMonthDayText: {
    color: '#555555',
  },
  otherMonthDayText: {
    color: '#888888',
  },
  scheduledText:{
    color:'#406eae'
  },
  selectedText:{
    color:'white'
  },
  selectedItem:{
    borderRadius:4,
    backgroundColor:'#406eae'
  },
  todayItem: {
    borderRadius:4,
    borderWidth:1,
    borderColor:'#406eae'
  }
});