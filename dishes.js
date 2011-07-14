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

function dishDisplay(response) {
    var responseObject =Ext.decode(response.responseText);
    //instead of making this into a string I should create javascript object, apply template
    htmlString = '<div class="dishinfo"><div class="dishDetails"><b>'+responseObject.menu_item.name+'</b><br/>';
    htmlString += '@'+responseObject.menu_item.restaurant.name+'<br>';
    //htmlString += '$ '+responseObject.menu_item.price+'<br>';
    if(responseObject.menu_item.menu_item_avg_rating_count) {
        htmlString += ratingDisplay(responseObject.menu_item.menu_item_avg_rating_count.avg_rating);
        htmlString += ' '+responseObject.menu_item.menu_item_avg_rating_count.count+' ratings';
    }
    htmlString += "</div>";
    if(responseObject.menu_item.description!="") {
        htmlString += '<div class="dataSection"><div class="sectionHead">Description</div><div class="sectionBody">'+responseObject.menu_item.description+'</div></div>';
    }
    /*for(i=0;i<responseObject[0].ingredients.length;i++) {
     htmlString += responseObject[0].ingredients[i].item;
        if(i<responseObject[0].ingredients.length - 1) {
            htmlString += ", ";
        }
    }*/
    htmlString += "</div>";
    /*
    for(i=0;i<responseObject[0].images.length;i++) {
        object = new Object();
        object.html = '<div class="foodImg"><img width="100" src="'+responseObject[0].images[i].file+'"></div>';
        object.xtype = 'panel';
        Ext.getCmp('carouselPnl').add(object);
    }
    */
    if(responseObject.menu_item.menu_item_ratings) {
        reviewString = '<div class="dataSection"><div class="sectionHead">Reviews</div><div class="sectionBody">';
        for(i=0;i<responseObject.menu_item.menu_item_ratings.length;i++) {


            reviewString += '<div class="picanddata">';
            reviewString += '<div class="pic"><img src="'+responseObject.menu_item.menu_item_ratings[i].user.user_profile_pic_url+'"></div>';
            reviewString += '<div class="data"><div class="username">'+responseObject.menu_item.menu_item_ratings[i].user.user_name+'</div>'+ ratingDisplay(responseObject.menu_item.menu_item_ratings[i].rating)+'</div>';
            reviewString += '<div class="reviewtext">'+responseObject.menu_item.menu_item_ratings[i].review+'</div>';
            reviewString += '</div>';
        }
        reviewString += '</div></div>';
        Ext.getCmp('detailPnl').add(reviewPnl);
        Ext.getCmp('reviewPnl').update(reviewString);
    }
    //Ext.getCmp('detailPnl').add(carouselPnl);
    Ext.getCmp('infoPnl').update(htmlString);
    myUID = localStorage.getItem("uid");
    if(myUID!="" && myUID!=null) {
        //Ext.getCmp('detailPnl').add(reviewForm);
        Ext.getCmp('userId').setValue(myUID);
        Ext.getCmp('menuId').setValue(responseObject.menu_item.id);
    }
    Ext.getCmp('detailPnl').doLayout();
}

Crave.dishDisplayPanel = new Ext.Panel({
  layout: 'vbox',
  width: '100%',
  dockedItems: Crave.create_titlebar({
    items: [{
      text: 'Back',
      handler: function() {
        Crave.viewport.setActiveItem(Ext.getCmp('mainPnl'));
      }
    }]
  }),
  items: [{
    xtype: 'panel',
    width: '100%',
    id: 'dishDetailHeader',
    height: 100,
    tpl: '<div class="dishinfo"><div class="dishDetails"><b>{name}</b><br/>' +
         '@ {restaurant.name}<br>' +
         '{[Crave.ratingDisplay(values.menu_item_avg_rating_count.avg_rating)]}' +
         '{menu_item_avg_rating_count.count} ratings</div>',
    data: {restaurant: {}, menu_item_avg_rating_count: {}}
  },{
    xtype: 'panel',
    cls: 'framePanel',
    width: '100%',
    id: 'dishLabelsPanel',
    dockedItems: [{
      dock : 'top',
      xtype: 'toolbar',
      cls: 'title',
      title: 'Labels'
    }],
    tpl: '<div class="dishLables">{[values.labels.join(",")]}</div>',
    data: {labels: ["test", "label", "somelabel"]}

  }],
  load_dish_data: function(dish_id) {
    Ext.Ajax.request({
      method: "GET",
      url: '/items/' + dish_id + '.json',
      success: function(response, options) {
        var menu_item = Ext.decode(response.responseText).menu_item;
        Ext.getCmp('dishDetailHeader').update(menu_item);
      }
    })
  }
});