Ext.regModel('Filters', {
    fields: ['label']
});
var filterStore = new Ext.data.JsonStore({
    model  : 'Filters',
    sorters: 'label',

    getGroupString : function(record) {
        return record.get('label')[0];
    },

    data: [
        {label: 'Gluten Free'},
        {label: 'Vegetarian'},
        {label: 'Vegan'},
        {label: 'High Protein'},
        {label: 'Paleo friendly'},
        {label: 'Sugar Free'},
        {label: 'Low Fat'},
        {label: 'Low Carb'},
        {label: 'Organic'},
        {label: 'Meat Lovers'},
        {label: 'Bang for your Buck'},
        {label: 'Spicy'},
        {label: 'Pescatarian Friendly'},
        {label: 'Late Night Eats'},
        {label: 'Dairy Free'},
        {label: 'Atkins Friendly'},
        {label: 'Four Hour Body (4HB)'}
    ]
});
var filterList = new Ext.List({
    width:'100%',
    height:'100%',
    scroll: false,
    title: "Dietary Preference",
    itemTpl : '<span class="labelname">{label}</span>',
    grouped : false,
    multiSelect: true,
    simpleSelect:true,
    indexBar: false,
    store: filterStore
});
labelString = "";
filterList.on('itemtap', function(dataView, index, item, e) {
    thisLabel = $(".labelname", item).text();
    labelString += " "+thisLabel;
    //alert(labelString);
});
//when youpress search, make json call to search results, repopulate listPnl store
//add distance control button
//add listener to button, add distance parameter to search string

var searchHandler = function(b,e) {
    backHandler();
    dishSearchStore.proxy.extraParams.q = labelString;
    var dfb = Ext.getCmp('distanceFilterButton').getPressed();
    dishSearchStore.proxy.extraParams.within = dfb.filter_value;
    dishSearchStore.load();
    console.log(dishSearchStore.proxy.url);
    Ext.getCmp('listPnl').setActiveItem(searchPnl);
    Ext.getCmp('searchPnl').setActiveItem(dishSearchList);
}

var distancePnl = function() {
  var items = [];
  Ext.each([".5", "2", "5", "10"], function(d) {
    items.push({
      text: d + " miles",
      ui: 'round',
      width: 64,
      filter_value: d
    });
  });
  items.push({
    text: "All",
    pressed: true,
    width: 35,
    ui: 'round'
  });
  return new Ext.Panel({
    cls: 'framePanel',
    dockedItems: [{
      dock : 'top',
      xtype: 'toolbar',
      cls: 'title',
      title: 'Distance from You'
    }],
    items: {
      xtype: 'panel',
      dockedItems: [{
        xtype: 'toolbar',
        ui: 'fancy',
        dock: 'top',
        layout:{
          pack:'center'
        },
        items:[{
          xtype:'segmentedbutton',
          id: 'distanceFilterButton',
          items: items
        }]
      }]
    }
  });

}();

var filterListPnl = new Ext.Panel({
  items: [distancePnl, {
    xtype: 'panel',
    cls: 'framePanel',
    layout: 'fit',
    height: 880,
    dockedItems: [{
      dock : 'top',
      xtype: 'toolbar',
      cls: 'title',
      title: 'Dietary Preference'
    }],
    items: filterList
  }],
  id: 'filterListPnl',
  //layout: 'vbox',
  width:'100%',
  height:'100%',
  scroll:'vertical',
  dockedItems:[{
    dock:'top',
    xtype:'toolbar',
    ui:'light',
    title:'Filters',
    layout: {
      type: 'hbox',
      pack:'justify'
    },
    items:[{
      text:'Cancel',
      ui:'normal',
      handler:backHandler
    },{
      text:'Search',
      ui:'normal',
      handler:searchHandler
    }]
  }]
});


dishTemplate = new Ext.XTemplate.from('dishesTemplate', {
  distDisplay: function(miles) {
    feet = Math.round(miles * 5280);
    if(feet<1000) {
      return feet+" feet";
    } else {
      return parseFloat(miles).toFixed(1)+' miles';
    }
  }
});

var dishStore = new Ext.data.Store({
    model: 'Dish',
    clearOnPageLoad: false,
    sorters: [{property: 'arating', direction: 'ASC'}],
    getGroupString : function(record) {
        var rating = parseInt(record.get('rating'));
        return Crave.ratingDisplay(rating);
    },
    proxy: {
       type:'ajax',
       url: '/items/nearby.json',
       reader: {
           type:'json',
           record:'menu_item'
       }
    }
});

var newDishForm = new Ext.form.FormPanel({
    scroll: 'vertical',
    dockedItems:[
       {
           dock:'top',
           xtype:'toolbar',
           ui:'light',
           title:'Crave',
           items:[{text:'Back',ui:'back', handler:backHandler}]
       }
    ],
    items: [
       {xtype: 'fieldset', title: 'New Restaurant', items: [
            {
                xtype: 'textfield',
                hidden:true,
                name: 'menu_item[restaurant_id]',
                id: 'restaurantId'
		    },
           {
               xtype: 'textfield',
               label:'Name',
               name: 'menu_item[name]',
               id: 'menuItemName'
           },
           {
               xtype: 'textfield',
               label:'Description',
               name: 'menu_item[description]',
               id: 'menuItemDescription'
           },
           {
               xtype: 'textfield',
               hidden:true,
               name: 'menu_item[user_id]',
               id: 'userId'
           },

           {
               xtype:'button',
               text: 'Submit',
               handler: function() {
                   Ext.getCmp('restaurantId').setValue(localStorage.getItem('editRestaurantId'));
                   Ext.getCmp('userId').setValue(localStorage.getItem("uid"));
                   newDishForm.submit({
                       url: '/menu_items',
                       method: 'post',
                       submitDisabled: true,
                       waitMsg: 'Saving Data...Please wait.',
                       success: function (objForm,httpRequest) {
                           var mbox = new Ext.MessageBox({});
                           mbox.alert("Record Saved");
                           //redirect back to restaurant list?
                       },
                       failure: function() {
                           console.log('submissionFailed');
                       }
                   })
               }
           }
        ]}
    ]
});



