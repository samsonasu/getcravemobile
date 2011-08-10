Ext.regModel('MenuLabel', {
    fields: ['menu_label', 'created_at', 'id']
});

var dishStore = new Ext.data.Store({
  model: 'Dish',
  clearOnPageLoad: false,
  sorters: [
    {property: 'rating', direction: 'DESC'},
    {property: 'distance', direction: 'ASC'}
  ],
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

Crave.buildNewDishPanel = function() {
  var submitForm = function() {
    var menu_item = form.getValues();
    menu_item.restaurant_id = localStorage.getItem('editRestaurantId');
    menu_item.user_id = localStorage.getItem('uid');
    TouchBS.wait("Adding Dish");
    Ext.Ajax.request({
       url: '/items.json',
       method: 'POST',
       jsonData: {
          menu_item: menu_item
       },
       success: function (response, options) {
         TouchBS.stop_waiting();
         Ext.Msg.alert("Thanks!", "Keep on Cravin'");
         var menu_item = Ext.decode(response.responseText).menu_item
         Crave.show_menu_item(menu_item.id);
       },
       failure: TouchBS.handle_failure
    });
  };
  var name_field = new Ext.form.Text({
     xtype: 'textfield',
     placeHolder:'Name',
     name: 'name',
     id: 'menuItemName'
  });

  var description_field = new Ext.form.TextArea({
    xtype: 'textareafield',
    placeHolder: 'Description',
    name: 'description',
    id: 'menuItemDescription'
  });

  var form = new Ext.form.FormPanel({
    cls: 'framePanel',
    height: "100%",
    items: [name_field,description_field],
    listeners: {
      beforesubmit: function() {
        submitForm();
        return false;
      }
    }
  });

  Crave.newDishPanel = new Ext.Panel({
    height: '100%',
    //layout: 'fit',
    dockedItems:Crave.create_titlebar({
      title: "Add a Menu Item",
      items: [{
        ui: 'iback',
        handler: Crave.back_handler
      },{
        text: 'Submit',
        handler: submitForm
      }]
    }),
    items: form
  });

  return Crave.newDishPanel;
};


//this is the new dish display, and it's not done yet so don't use it.
Crave.buildDishDisplayPanel = function() {
  
  var imageCarousel = new Ext.Carousel({
    cls: 'dishCarousel',
    height: 100,
    width: '100%',
    hidden: true,
    items: [{
        xtype: 'panel',
        html: '<p>No Image Available</p>'
    }],
    listeners: {
      render: function(c) {
        c.el.on('click', function() {
          var images = c.el.query('IMG');
          imageCarousel.bs_expanded = !c.bs_expanded;
          for (var i=0; i<images.length; i++) {
            var img = images[i];
            if (imageCarousel.bs_expanded) {
              img.style.webkitTransform = "translate(0, 0)";
              //45 is the height of the title bar
              imageCarousel.setHeight(Math.min(img.height, dishPanel.getHeight()-45));
            } else {
              img.style.webkitTransform = "translate(0, -" + img.height/2 + "px)";
              setTimeout(function() {
                imageCarousel.setHeight(100, true);
              }, 333/2); //setting this to half the transition period so it looks better
            }
          }
          //Crave.show_image('http://src.sencha.io/' +photo.photo, {type: 'slide', direction: 'down'});
        });
      },
      cardswitch: function(carousel, newCard, oldCard, anim) {
         if (imageCarousel.bs_expanded) {
           var img = newCard.el.down('IMG').dom;
           //45 is the height of the title bar
           imageCarousel.setHeight(Math.min(img.height, dishPanel.getHeight()-45));
         }
      }
    }
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
  var addButtonHandler = function() {
    if (Crave.isLoggedIn()) {
      addSheet.show();
    } else {
      Crave.viewport.setActiveItem(Crave.myProfilePanel);
    }
  };

  var reviewsPanel = new Ext.Panel({
    layout: 'fit',
    dockedItems: Crave.create_titlebar({
      items: [{
        text: 'Back',
        ui: 'iback',
        handler: Crave.back_handler
      },{
        text: "Add",
        handler: addButtonHandler
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
    addSheet.hide();
    TouchBS.wait("Uploading photo...");

    var menu_item_id = Crave.dishDisplayPanel.current_menu_item.id; //get a closure on this for later
    var user_id = Crave.currentUserId(); //this too, in case they log out real quick (unlikely)

    var fail_handler = function() {
      TouchBS.stop_waiting();
      Ext.Msg.show({
        title: "Can't upload",
        msg: "We're having problems uploading your photo, probably because of network conditions.  Try again?",
        buttons: Ext.MessageBox.YESNO,
        fn: function(btn) {
          if (btn === 'yes') {
            uploadHandler(imageURI);
          } 
        }
      });
    };

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
          Crave.dishDisplayPanel.load_dish_data(menu_item_id, function() {
            imageCarousel.setActiveItem(imageCarousel.items.length-1);
            TouchBS.stop_waiting();
            Ext.Msg.alert("Thanks for the photo!", "Keep on Cravin'");
          });
        }, 
        failure: fail_handler
      });
    }, fail_handler); 
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
        Crave.dishDisplayPanel.setup_back_stack(dishPanel);
        labelsPanel.set_menu_item(Crave.dishDisplayPanel.current_menu_item);
        Crave.dishDisplayPanel.setActiveItem(labelsPanel, {type: 'slide', direction: 'left'});
        addSheet.hide();
      }
    },{
      text: "Take a Photo", 
      hidden: !Crave.phonegap,
      handler: function() {
        TouchBS.wait("Please wait");
        navigator.camera.getPicture(uploadHandler, function (message) {
          //Photo capture failed, usually this is because they clicked cancel
          addSheet.hide();
        }, { 
          quality: 50, 
          destinationType: Camera.DestinationType.FILE_URI,
          sourceType: Camera.PictureSourceType.CAMERA,
          correctOrientation: true,
          saveToPhotoAlbum: true,
          targetWidth: 800,
          targetHeight: 600
        });
      }
    },{
      text: "Use an Existing Photo", 
      hidden: !Crave.phonegap,
      handler: function() {
        TouchBS.wait("Please wait");
        navigator.camera.getPicture(uploadHandler, function (message) {
          //Photo capture failed, usually this is because they clicked cancel
          addSheet.hide();
        }, { 
          quality: 50, 
          destinationType: Camera.DestinationType.FILE_URI,
          sourceType : Camera.PictureSourceType.PHOTOLIBRARY,
          correctOrientation: true,
          targetWidth: 800,
          targetHeight: 600
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

  var labelsPanel = Crave.buildAddLabelPanel({
    success_callback: function() {
      Ext.Msg.alert("Thanks for the Label!", "Keep on Cravin'.");
      Crave.back_handler();
      Crave.dishDisplayPanel.load_dish_data(labelsPanel.current_menu_item_id);
    }
  });

  
  var dishPanel = new Ext.Panel({
    width: '100%',
    scroll: 'vertical',
    dockedItems: Crave.create_titlebar({
      items: [{
        text: 'Back',
        ui: 'iback',
        handler: Crave.back_handler
      }, {
        text: "Add",
        handler: addButtonHandler
      }]
    }),
    items: [imageCarousel,{
      xtype: 'panel',
      width: '100%',
      id: 'dishDetailHeader',
      tpl: '<div class="dishInfo">'+
           '<div onclick="Crave.dishDisplayPanel.toggle_saved();" class="savedFlag {[values.saved ? "saved" : ""]}">Save</div>' +
           '<b>{name}</b><br/>' +
           '@ <a href="#" onclick="Crave.dishDisplayPanel.setup_back_stack(0);Crave.show_restaurant({restaurant.id});">{restaurant.name}</a><br>' +
           '<tpl if="menu_item_avg_rating_count">' +
           '{[Crave.ratingDisplay(values.menu_item_avg_rating_count.avg_rating)]}' +
           '{menu_item_avg_rating_count.count} ratings</div>' +
           '</tpl>',
      data: {restaurant: {}}
    },{ //these frame panels need to be wrapped in a panel with side padding
        //because Ext freaks out if a panel has side margin
      xtype: 'panel',
      bodyStyle: "padding: 0 .5em 0 .5em;",
      items: [{
        xtype: 'panel',
        cls: 'framePanel',
        width: '100%',
        id: 'dishLabelsPanel',
        dockedItems: [{
          dock : 'top',
          xtype: 'toolbar',
          cls: 'title clickable',
          title: 'Dish Labels'
        }],
        tpl: '<div class="dishLabels">{[values.labels.join(", ")]}</div>',
        data: {labels: []},
        listeners: {
          afterrender: function(c){
            c.el.on('click', function(){
              if (!Crave.isLoggedIn()) {
                Crave.viewport.setActiveItem(Crave.myProfilePanel);
                return;
              }
              Crave.dishDisplayPanel.setup_back_stack(dishPanel);
              labelsPanel.set_menu_item(Crave.dishDisplayPanel.current_menu_item);
              Crave.dishDisplayPanel.setActiveItem(labelsPanel, {type: 'slide', direction: 'left'});
            });
          }
        }
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
        tpl: new Ext.XTemplate.from('dishRatingTemplate', {
          getBackPanelIndex: function() {
            return Crave.dishDisplayPanel.items.indexOf(dishPanel);
          }
        }),
        data: {user: {}},
        listeners: {
          afterrender: function(c){
            c.el.on('click', function(comp, target){
              if (target instanceof HTMLAnchorElement) {
                return; //they clicked on the link to a person so dont do anything
              }
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
              window.open(Crave.restaurant_map_url(mi.restaurant));
            });
          }
        }
      }]
    }]
  });
  
  Crave.dishDisplayPanel = new Ext.Panel({
    layout: 'card', 
    items: [dishPanel, reviewsPanel, labelsPanel],
    activeItem: 0, 
    load_dish_data: function(dish_id, callback) {
      dishPanel.setLoading('Loading...');
      Crave.dishDisplayPanel.setActiveItem(dishPanel, false);
      Ext.Ajax.request({
        method: "GET",
        url: '/items/' + dish_id + '.json',
        success: function(response, options) {
          var menu_item = Ext.decode(response.responseText).menu_item;
          Crave.dishDisplayPanel.load_dish(menu_item, callback);
          dishPanel.setLoading(false);
        }
      });
    },
    load_dish: function(menu_item, callback) {
      Crave.dishDisplayPanel.current_menu_item = menu_item;
      //check to see if this is saved
      if (Crave.isLoggedIn()) {
        Ext.Ajax.request({
          method: 'GET',
          url: "/saved/is_saved.json",
          scope: this,
          params: {
            user_id: Crave.currentUserId(),
            menu_item_id: menu_item.id
          },
          success: function(response, options) {
            if (response.responseText !== "" && response.responseText !== "null") {
              var saved_menu_item = Ext.decode(response.responseText).user_saved_menu_item;
              var savedFlag = dishPanel.el.down(".savedFlag");
              savedFlag.addCls('saved');
              savedFlag.dom.innerHTML = "Saved";
              Crave.dishDisplayPanel.current_menu_item.user_saved_menu_item_id = saved_menu_item.id;
            }
          }
        });
      }
      //Set up the image carousel at the top
      if (menu_item.menu_item_photos) {
        //imageCarousel.removeAll();
        var items = [];
        Ext.each(menu_item.menu_item_photos, function(photo) {
          items.push(new Ext.Panel({
            cls: 'dishCarouselImage', 
            html: '<img onload="Crave.dishImageLoaded(this);" src="http://src.sencha.io/' + photo.photo + '">',
            
          }));
        });
        imageCarousel.removeAll();
        if (items.length > 0) {
          imageCarousel.setHeight(100);
          imageCarousel.add(items);
          imageCarousel.show();
        } else {
          imageCarousel.hide();
        }
        imageCarousel.doLayout();
      }
      //Dish header is easy, so is description
      Ext.getCmp('dishDetailHeader').update(menu_item);
      //Ext.getCmp('dishDetailHeader').doComponentLayout();
      if (menu_item.description == null || menu_item.description === "") {
        Ext.getCmp('dishDescriptionPanel').hide();
      } else {
        Ext.getCmp('dishDescriptionPanel').show();
        Ext.getCmp('dishDescriptionPanel').update(menu_item);
        Ext.getCmp('dishDescriptionPanel').onResize();
      }

      //Update ratings or hide if there aren't any
      var drp = Ext.getCmp('dishRatingPanel');
      if (menu_item.menu_item_ratings.length > 0) {
        drp.show();
        drp.getEl().down('.x-toolbar-title').dom.innerHTML = 'Reviews <span class="count">(' + menu_item.menu_item_ratings.length + ")</span>";
        
        drp.update({user:{}});
        drp.doLayout();
        drp.update(menu_item.menu_item_ratings[0]);
        dishPanel.doComponentLayout();
        
        //Sencha sucks and they modify this in place to become an array of records instead of an array of {}s
        //I hate them
        var ratingsData = TouchBS.clone(menu_item.menu_item_ratings);
        reviewStore.loadData(ratingsData);
      } else {
        drp.hide();
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

      if (labels.length === 0) {
        labels.push("Add a Label");
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
      if (callback) {
        callback(menu_item);
      }
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
    },
    toggle_saved: function() {
      var savedFlag = this.el.down(".savedFlag");
      TouchBS.wait("Please wait...");
      if (this.current_menu_item.user_saved_menu_item_id) {
        Ext.Ajax.request({
          method: "DELETE",
          url: '/saved/' + this.current_menu_item.user_saved_menu_item_id + '.json',
          failure: Crave.handle_failure,
          scope: this,
          success: function(response, options) {
            TouchBS.stop_waiting();
            savedFlag.dom.innerHTML = "Save";
            savedFlag.removeCls('saved');
            this.current_menu_item.saved_by_current_user = false;
          }
        });
      } else {
        Ext.Ajax.request({
          method: "POST",
          url: '/saved.json',
          jsonData:{
            user_saved_menu_item: {
              user_id: Crave.currentUserId(),
              menu_item_id: this.current_menu_item.id
            }
          },
          scope: this,
          failure: Crave.handle_failure,
          success: function(response, options) {
            TouchBS.stop_waiting();
            var saved_menu_item = Ext.decode(response.responseText).user_saved_menu_item;
            savedFlag.dom.innerHTML = "Saved";
            savedFlag.addCls('saved');
            this.current_menu_item.user_saved_menu_item_id = saved_menu_item.id;
          }
        });
      }
    }
  })
  return Crave.dishDisplayPanel; 
}

Crave.dishImageLoaded = function(img) {
  var y = img.height / 2;
  //img.style["-webkit-transform"] = "translate(0, -" + y + "px)";

  img.style.webkitTransition = "";
  img.style.webkitTransform = "translate(0, -" + y + "px)";
  setTimeout(function() {
    img.style.webkitTransition = "-webkit-transform .3s ease-in";
  }, 100);
};

//obj is something with a photo, so far either a menu item or a user
Crave.photo_url = function(obj, placeholder) {
  if (placeholder === undefined) {
    placeholder = true;
  }
  if (obj.menu_item_photos && obj.menu_item_photos.length > 0) {
    var photo_url = obj.menu_item_photos[0].photo;
    return "http://src.sencha.io/" + photo_url;
  } 
  
  if (obj.user_profile_pic_url) {
    return "http://src.sencha.io/" + obj.user_profile_pic_url;
  }
  if (placeholder) {
    return "../images/no-image-default.jpg";
  } else {
    return null;
  }
};

Crave.photo_for = function(obj, placeholder) {
  var photo_url = Crave.photo_url(obj, placeholder);
  if (photo_url) {
    return '<img src='+photo_url+' class="dishImg" style="height: 60px;">';
  } else {
    return "";
  }
}


Crave.uploadPhoto = function(imageURI, callback, fail_callback) {
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
  options.fileName = new Date().getTime() + ".jpg";
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


  var ft = new FileTransfer();
  ft.upload(imageURI, "http://getcrave.s3.amazonaws.com", win, fail_callback, options);  
};