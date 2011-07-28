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
  
  var imageCarousel = new Ext.Carousel({
    height: 100,
    width: '100%',
    items: [{
        xtype: 'panel',
        html: '<p>No Image Available</p>'
    },{
        xtype: 'panel',
        html: '<p>No Image Available</p>'
    }]
  });
  
  
  var reviewStore = new Ext.data.Store({
    model: 'MenuItemRating',
    data : [],
    proxy: {
      type: 'memory',
      reader: {
        type: 'json'
      }
    }
  });
  
  var marker = null;
  
  var reviewsPanel = new Ext.Panel({
    layout: 'fit',
    dockedItems: Crave.create_titlebar({
      items: [{
        text: 'Back',
        ui: 'back',
        handler: Crave.back_handler
      }]
    }),
    items: new Ext.List({
      itemTpl: new Ext.XTemplate.from('dishRatingTemplate', {
        getBackPanelIndex: function() {
          return Crave.dishDisplayPanel.items.indexOf(reviewsPanel);
        }
      }),
      itemSelector: '.arating',
      singleSelect: true,
      grouped: false,
      indexBar: false,
      store: reviewStore,
      loadingText: "Loading",
      scroll: 'vertical',
      clearSectionOnDeactivate:true
    })
  });
  
  var dishPanel = new Ext.Panel({
    layout: 'vbox',
    width: '100%',
    scroll: 'vertical',
    dockedItems: Crave.create_titlebar({
      items: [{
        text: 'Back',
        handler: Crave.back_handler
      }, {
        text: "Rate", 
        handler: function() {
          Crave.dishDisplayPanel.setup_back_stack(dishPanel);
          Crave.new_dish_rating(Crave.dishDisplayPanel.current_menu_item);
        }
      }]
    }),
    items: [imageCarousel,{
      xtype: 'panel',
      width: '100%',
      id: 'dishDetailHeader',
      height: 100,
      tpl: '<div class="dishInfo"><b>{name}</b><br/>' +
           '@ {restaurant.name}<br>' +
           '<tpl if="menu_item_avg_rating_count">' +
           '{[Crave.ratingDisplay(values.menu_item_avg_rating_count.avg_rating)]}' +
           '{menu_item_avg_rating_count.count} ratings</div>' + 
           '</tpl>',
      data: {restaurant: {}}
    },{
      xtype: 'panel',
      cls: 'framePanel',
      width: '100%',
      id: 'dishLabelsPanel',
      dockedItems: [{
        dock : 'top',
        xtype: 'toolbar',
        cls: 'title',
        title: 'Dish Labels'
      }],
      tpl: '<div class="dishLabels">{[values.labels.join(",")]}</div>',
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
      id: 'dishRatingPanel',
      dockedItems: [{
        dock : 'top',
        xtype: 'toolbar',
        cls: 'title clickable',
        title: 'Reviews'
      }],
      items: {
        id: 'dishDisplayRating',
        tpl: new Ext.XTemplate.from('dishRatingTemplate', {
          getBackPanelIndex: function() {
            return Crave.dishDisplayPanel.items.indexOf(dishPanel);
          }
        }),
        data: {user: {}}
      },
      listeners: {  
        afterrender: function(c){
          c.el.on('click', function(){
            Crave.dishDisplayPanel.setup_back_stack(dishPanel);
            Crave.dishDisplayPanel.setActiveItem(reviewsPanel, {type: 'slide', direction: 'left'});
          });
        }
      }
    },{
      xtype: 'panel', 
      cls: 'framePanel',
      width: '100%',
      dockedItems: [{
        dock : 'top',
        xtype: 'toolbar',
        cls: 'title clickable',
        style: 'margin: 0;',
        title: 'Address',
        listeners: {  
          afterrender: function(c){
            c.el.on('click', function(){
              alert('address details go here?')
            });
          }
        }
      }],
      items: [{
        id: 'dishMap',
        xtype: 'map',
        useCurrentLocation: false,
        height: 125,
        width: '100%',
        mapOptions : {
          center : new google.maps.LatLng(37.774518,-122.420101),  //SF
          //not really centering here, just putting it in top right corner
          zoom : 17,
          mapTypeId : google.maps.MapTypeId.ROADMAP,
          disableDefaultUI: true,
          navigationControl: false
        }
      },{
        xtype: 'panel', 
        id: 'dishAddress', 
        tpl: '<div class="dishAddress">{street_address}<br/>{city}, {state} {zip}</div>',
        data: {}
      }]
    }]
    
  });
  
  Crave.dishDisplayPanel = new Ext.Panel({
    layout: 'card', 
    items: [dishPanel, reviewsPanel],
    activeItem: 0, 
    load_dish_data: function(dish_id) {
      dishPanel.setLoading('Loading');
      Ext.Ajax.request({
        method: "GET",
        url: '/items/' + dish_id + '.json',
        success: function(response, options) {
          var menu_item = Ext.decode(response.responseText).menu_item;
          Crave.dishDisplayPanel.load_dish(menu_item);
          //and we're done
          dishPanel.setLoading(false);
        }
      });
    },
    load_dish: function(menu_item) {
      Crave.dishDisplayPanel.current_menu_item = menu_item;    
      //Set up the image carousel at the top
      if (menu_item.menu_item_photos) {
        //imageCarousel.removeAll();
        var items = [];
        Ext.each(menu_item.menu_item_photos, function(photo) {
          items.push(new Ext.Panel({
            cls: 'dishCarouselImage', 
            html: '<img onload="Crave.dishImageLoaded(this);" src="http://src.sencha.io/' + photo.photo + '">'
          }));
        });
        imageCarousel.removeAll();
        if (items.length > 0) {
          imageCarousel.add(items);
          imageCarousel.show();
          imageCarousel.doLayout();
        } else {
          imageCarousel.hide();
        }
      }
      //Dish header is easy, so is description
      Ext.getCmp('dishDetailHeader').update(menu_item);
      Ext.getCmp('dishDescriptionPanel').update(menu_item);

      //Update ratings or hide if there aren't any
      if (menu_item.menu_item_ratings.length > 0) {
        Ext.getCmp('dishDisplayRating').update(menu_item.menu_item_ratings[0]);
        Ext.getCmp('dishRatingPanel').getEl().down('.x-toolbar-title').dom.innerHTML = 'Reviews <span class="count">(' + menu_item.menu_item_ratings.length + ")</span>";
        Ext.getCmp('dishRatingPanel').show();
        reviewStore.loadData(menu_item.menu_item_ratings);
      } else {
        Ext.getCmp('dishRatingPanel').hide();
      }

      // Update labels
      var label_map = {};
      Ext.each(menu_item.menu_label_associations, function(assoc) {
        var l = assoc.menu_label.menu_label;
        if (!label_map[l]) {label_map[l] = 0;}
        label_map[l]++;
      });
      var labels = [];
      for (var l in label_map) {
        labels.push(l + " (" + label_map[l] + ")");
      }

      Ext.getCmp('dishLabelsPanel').update({labels: labels});

      //update the map
      Ext.getCmp('dishMap').update(menu_item.restaurant);
      if (marker) {
        marker.setMap(null);
      }
      marker = new google.maps.Marker({
        position: new google.maps.LatLng(menu_item.restaurant.latitude,menu_item.restaurant.longitude),
        map: Ext.getCmp('dishMap').map,
        title: 'restaurant'
      });
      Ext.getCmp('dishAddress').update(menu_item.restaurant);

      dishPanel.scroller.scrollTo({ x: 0, y: 0 });
    },
    setup_back_stack: function(subPanel) {
      Crave.back_stack.push({
        panel: Crave.dishDisplayPanel,
        menu_item: Crave.dishDisplayPanel.current_menu_item,
        callback: function(backInfo) {
          if (backInfo.menu_item.id !== Crave.dishDisplayPanel.current_menu_item.id) {
            Crave.dishDisplayPanel.load_dish(backInfo.menu_item);
          }
          Crave.dishDisplayPanel.setActiveItem(subPanel, {type: 'slide', direction: 'right'});
        }
      });
    }
  })
  return Crave.dishDisplayPanel; 
}

Crave.dishImageLoaded = function(img) {
  var y = img.height / 2;
  img.style["-webkit-transform"] = "translate(0, -" + y + "px)";
}

//obj is something with a photo, so far either a menu item or a user
Crave.photo_url = function(obj) {
  if (obj.menu_item_photos && obj.menu_item_photos.length > 0) {
    var photo_url = obj.menu_item_photos[0].photo;
    return "http://src.sencha.io/" + photo_url;
  } 
  
  if (obj.user_profile_pic_url) {
    return "http://src.sencha.io/" + obj.user_profile_pic_url;
  }

  return "../images/no-image-default.png";
};