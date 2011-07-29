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
      pressed: d === '.5',
      width: 64,
      filter_value: d
    });
  });
  items.push({
    text: "All",
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
  
  //receive the image from phonegap, upload it, and associate with the correct menu item
  var uploadHandler = function(imageURI) { //get the photo
    var menu_item_id = Crave.dishDisplayPanel.current_menu_item.id; //get a closure on this for later
    var user_id = Crave.currentUserId(); //this too, in case they log out real quick (unlikely)
    addSheet.hide();
    Ext.Msg.alert("Thanks for the photo!", "Keep on Cravin'");
    Crave.uploadPhoto(imageURI, function(photo_url) { //upload it to s3
      //console.log("posting " + photo_url + "to menu_item_photos.json, mi=" + menu_item_id + " user=" + user_id);
      Ext.Ajax.request({ //post the association to the menu item
        method: 'POST',
        url :'/menu_item_photos.json',
        jsonData: {
          menu_item_photo: {
            menu_item_id: menu_item_id,
            photo: photo_url, 
            user_id: user_id
          }
        },
        success: function() {
          console.log('photo successfuly uploaded and associated');
        }, 
        failure: TouchBS.handle_failure
      });
    }); 
  }
  
  
  var addSheet = new Ext.ActionSheet({
    items: [{
      text: 'Add a Review',
      handler: function() {
        Crave.dishDisplayPanel.setup_back_stack(dishPanel);
        Crave.new_dish_rating(Crave.dishDisplayPanel.current_menu_item);
        addSheet.hide();
      }
    },{
      text: 'Add a Label',
      handler: function() {
        
      }
    },{
      text: "Take a Photo", 
      hidden: !Crave.phonegap,
      handler: function() {
        navigator.camera.getPicture(uploadHandler, function (message) {
          //Photo capture failed, usually this is because they clicked cancel
          addSheet.hide();
        }, { 
          quality: 50, 
          destinationType: Camera.DestinationType.FILE_URI,
          sourceType : Camera.PictureSourceType.CAMERA
        });
      }
    },{
      text: "Use an Existing Photo", 
      hidden: !Crave.phonegap,
      handler: function() {
        navigator.camera.getPicture(uploadHandler, function (message) {
          //Photo capture failed, usually this is because they clicked cancel
          addSheet.hide();
        }, { 
          quality: 50, 
          destinationType: Camera.DestinationType.FILE_URI,
          sourceType : Camera.PictureSourceType.PHOTOLIBRARY 
        });
      }
    },{
      text: 'Cancel',
      ui: 'action',
      handler: function() {
        addSheet.hide();
      }
    }]
  });

  
  var dishPanel = new Ext.Panel({
    layout: 'vbox',
    width: '100%',
    scroll: 'vertical',
    dockedItems: Crave.create_titlebar({
      items: [{
        text: 'Back',
        ui: 'back',
        handler: Crave.back_handler
      }, {
        text: "Add", 
        handler: function() {
          if (Crave.isLoggedIn()) {
            addSheet.show();
          } else {
            Crave.viewport.setActiveItem(Crave.myProfilePanel);
          }
          
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
        title: 'Address'
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
          navigationControl: false,
          draggable: false
        }
      },{
        xtype: 'panel', 
        id: 'dishAddress', 
        tpl: '<div class="dishAddress">{street_address}<br/>{city}, {state} {zip}</div>',
        data: {}
      }],
      listeners: {  
        afterrender: function(c){
          c.el.on('click', function(){
            var mi = Crave.dishDisplayPanel.current_menu_item;
            window.open('http://maps.google.com/maps?ll=' + [mi.restaurant.latitude, mi.restaurant.longitude].join(','))
          });
        }
      }
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
      if (menu_item.description == null || menu_item.description === "") {
        Ext.getCmp('dishDescriptionPanel').hide();
      } else {
        Ext.getCmp('dishDescriptionPanel').update(menu_item);
        Ext.getCmp('dishDescriptionPanel').show();
        Ext.getCmp('dishDescriptionPanel').onResize();
      }
        
      

      //Update ratings or hide if there aren't any
      if (menu_item.menu_item_ratings.length > 0) {
        Ext.getCmp('dishDisplayRating').update(menu_item.menu_item_ratings[0]);
        var drp = Ext.getCmp('dishRatingPanel');
        drp.getEl().down('.x-toolbar-title').dom.innerHTML = 'Reviews <span class="count">(' + menu_item.menu_item_ratings.length + ")</span>";
        drp.show();
        //var new_height = drp.getEl().down('.review').dom.clientHeight;
        
        drp.onResize();
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

      dishPanel.scroller.scrollTo({x: 0, y: 0});
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


Crave.uploadPhoto = function(imageURI, callback) {
  var form = document.createElement('form');
  form.setAttribute('action', "http://getcrave.s3.amazonaws.com/");
  form.setAttribute('method', 'post');
  form.setAttribute('enctype', 'multipart/form-data');
  var params = {
    acl: 'public-read',
    AWSAccessKeyId: '1BMA7PKM3W1YE7FDW982',
    Policy: "eyAiZXhwaXJhdGlvbiI6ICIyMDEyLTA3LTI4VDEyOjAwOjAwLjAwMFoiLAogICJjb25kaXRpb25zIjogWwogICAgeyJhY2wiOiAicHVibGljLXJlYWQiIH0sCiAgICB7ImJ1Y2tldCI6ICJnZXRjcmF2ZSIgfSwKICAgIFsic3RhcnRzLXdpdGgiLCAiJGtleSIsICJtb2JpbGVfdXBsb2Fkcy8iXSwKICAgIFsic3RhcnRzLXdpdGgiLCAiJENvbnRlbnQtVHlwZSIsICJpbWFnZS8iXSwKICBdCn0=",
    Signature: "JsA3b8MWOZJvbmWr92F7lNN48Rc=",
    "Content-Type": "image/jpeg"
  };
  
//  for (var p in params) {
//    var f = document.createElement('input');
//    f.setAttribute('type', 'hidden');
//    f.setAttribute('name', p);
//    f.setAttribute('value', params[p]);
//    form.appendChild(f);
//  }
//  alert("uploading2 " + imageURI);
//  var file = document.createElement('input');
//  file.setAttribute('type', 'file');
//  file.setAttribute('name', 'file');
//  var varpos = imageURI.indexOf('/var');
//  
//  file.setAttribute('value', imageURI.substring(varpos));
//  form.appendChild(file);
//  
//  document.body.appendChild(form);
//  form.submit();

//  return;
  //phonegap
  var options = new FileUploadOptions();
  options.fileKey="file";
  options.fileName=imageURI.substr(imageURI.lastIndexOf('/')+1);
  options.mimeType="image/jpg";
  params.key = 'mobile_uploads/user_' + Crave.currentUserId() + '/' + options.fileName;
  options.params = params;
  
  var win = function(r) {
    console.log("Code = " + r.responseCode);
    console.log("Response = " + r.response);
    console.log("Sent = " + r.bytesSent);
    console.log(params.key);
    callback("http://getcrave.s3.amazonaws.com/" + params.key);
  }

  var fail = function(error) {
      alert("An error has occurred: Code = " + error.code);
  }


  var ft = new FileTransfer();
  ft.upload(imageURI, "http://getcrave.s3.amazonaws.com", win, fail, options);  
  
  
  
};