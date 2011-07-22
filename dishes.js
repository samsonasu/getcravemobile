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
      handler: Crave.back_handler
    },{
      text:'Search',
      ui:'normal',
      handler:searchHandler
    }]
  }]
});


dishTemplate = new Ext.XTemplate.from('dishesTemplate', {
  distDisplay: function(miles) {
    var feet = Math.round(miles * 5280);
    if(feet<1000) {
      return feet+" feet";
    } else {
      return parseFloat(miles).toFixed(1)+' miles';
    }
  },
  //right now this just grabs the first image
  photo_url: function(menu_item) {
    if (menu_item.menu_item_photos && menu_item.menu_item_photos.length > 0) {
      var photo_url = menu_item.menu_item_photos[0].photo;
      return "http://src.sencha.io/" + photo_url;
    } 
    
    return "../images/no-image-default.png";
  }
});

var dishStore = new Ext.data.Store({
    model: 'Dish',
    clearOnPageLoad: false,
    sorters: [{property: 'arating', direction: 'ASC'}],
    getGroupString : function(record) {
        return Crave.ratingDisplay(record.get('rating'));
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
           items:[{text:'Back',ui:'back', handler:Crave.back_handler}]
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
        htmlString += Crave.ratingDisplay(responseObject.menu_item.menu_item_avg_rating_count.avg_rating);
        htmlString += ' '+responseObject.menu_item.menu_item_avg_rating_count.count+' ratings';
    }
    htmlString += "</div>";
    if(responseObject.menu_item.description!="") {
        htmlString += '<div class="dataSection"><div class="sectionHead">Description</div><div class="sectionBody">'+responseObject.menu_item.description+'</div></div>';
    }
    
    htmlString += "</div>";
  
    if(responseObject.menu_item.menu_item_ratings && responseObject.menu_item.menu_item_ratings.length > 0) {
        reviewString = '<div class="dataSection"><div class="sectionHead">Reviews</div><div class="sectionBody">';
        for(i=0;i<responseObject.menu_item.menu_item_ratings.length;i++) {

            var profile_pic_url = responseObject.menu_item.menu_item_ratings[i].user.user_profile_pic_url || "../images/no-image-default.png";
            reviewString += '<div class="picanddata">';
            reviewString += '<div class="pic"><img src="'+profile_pic_url+'"></div>';
            reviewString += '<div class="data"><div class="username">'+responseObject.menu_item.menu_item_ratings[i].user.user_name+'</div>'+ Crave.ratingDisplay(responseObject.menu_item.menu_item_ratings[i].rating)+'</div>';
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
    //Ext.getCmp('detailPnl').doLayout();
    Crave.viewport.setActiveItem(detailPnl);
}


//this is the new dish display, and it's not done yet so don't use it.
Crave.buildDishDisplayPanel = function() {

  Crave.dishDisplayPanel = new Ext.Panel({
    layout: 'vbox',
    width: '100%',
    dockedItems: Crave.create_titlebar({
      items: [{
        text: 'Back',
        handler: Crave.back_handler
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
    },{
      xtype: 'panel',
      cls: 'framePanel',
      width: '100%',
      id: 'dishDescriptionPanel',
      dockedItems: [{
        dock : 'top',
        xtype: 'toolbar',
        cls: 'title',
        title: 'Description'
      }],
      tpl: '<div class="dishDescription">{description}</div>',
      data: {}
    },{
      xtype: 'panel',
      cls: 'framePanel',
      width: '100%',
      id: 'dishReviewsPanel',
      dockedItems: [{
        dock : 'top',
        xtype: 'toolbar',
        cls: 'title',
        title: 'Reviews'
      }],
      data: {menu_item_ratings: []}
    }],
    load_dish_data: function(dish_id) {
      Ext.Ajax.request({
        method: "GET",
        url: '/items/' + dish_id + '.json',
        success: function(response, options) {
          var menu_item = Ext.decode(response.responseText).menu_item;
          Ext.getCmp('dishDetailHeader').update(menu_item);
        }
      });
    }
  });
  return Crave.dishDisplayPanel; 
}