Ext.setup({
  glossOnIcon: false,
  onReady: function(){
    Crave.app_version = "1.0";
    
    urlPrefix = "http://getcrave.com";
    var local = false;

    if(window.location.toString().indexOf("local")>-1) {
      //urlPrefix = '/wg/proxy.php?url=http://blooming-water-228.heroku.com';
      urlPrefix = '/cravecomp';
      local = true;
    }

    Ext.Ajax.on('beforerequest', function(conn, options){
      if (options.url.substring(0, urlPrefix.length) !== urlPrefix) {
        options.url = urlPrefix + options.url;
      }
      if (true || local) {
        if (!options.params) {
          options.params = {};
        }
        options.params.mobile = "true";
      }
    }, this);
    
    Crave.updateLocation(function(coords) {
      dishStore.proxy.extraParams = {
        "lat": coords.latitude,
        "long": coords.longitude,
        limit: 25
      }
      dishStore.load();

      places.proxy.extraParams = {
        "lat": coords.latitude,
        "long": coords.longitude,
        limit: 25
      }

      places.load();
      Crave.activityStore.load();
    });


    var placesList = new Ext.List({
      itemTpl: restaurantTemplate,
      itemSelector: '.aplace',
      singleSelect: true,
      grouped: false,
      indexBar: false,
      store: places,
      hideOnMaskTap: false,
      clearSectionOnDeactivate:true,
      plugins: [new Ext.plugins.ListPagingPlugin()]
    });
    placesList.on('itemtap', function(dataView, index, item, e) {
      var record = dataView.store.data.items[index];
      Crave.back_stack.push({
        panel: listPnl
      });
      placeDisplay(record.data.id);
    });

    var dishList = new Ext.List({
      itemTpl: Crave.dishTemplate,
      itemSelector: '.adish',
      singleSelect: true,
      grouped: true,
      indexBar: false,
      store: dishStore,
      id:'dishesNearbyList',
      scroll:'vertical',
      hideOnMaskTap: false,
      clearSectionOnDeactivate:true,
      plugins: [new Ext.plugins.ListPagingPlugin(), new Ext.plugins.PullRefreshPlugin({
        refreshFn: function(cb, scope) {
          Crave.updateLocation(function(coords) {
            dishStore.proxy.extraParams.lat = coords.latitude;
            dishStore.proxy.extraParams.lon = coords.longitude;
            dishStore.load({
              scope: scope,
              callback: cb
            });
          });
        }
      })]
    });

    dishList.on('itemtap', function(dataView, index, item, e) {
      var thisId = dishStore.findRecord("name",$(".dishname", item).text()).data.id;
      Crave.back_stack.push({panel: listPnl});
      Crave.show_menu_item(thisId);
    });

/*
    var dishPlaceStore = new Ext.data.Store({
        model: 'Dish',
        clearOnPageLoad: true,
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


    var dishPlaceList = new Ext.List({
      itemTpl: Ext.XTemplate.from('dishPlaceTemplate'),
      itemSelector: '.item',
      singleSelect: true,
      grouped: true,
      indexBar: false,
      store: dishPlaceStore,
      scroll:'vertical',
      hideOnMaskTap: false,
      clearSectionOnDeactivate:true,
      plugins: [new Ext.plugins.ListPagingPlugin()],
      listeners: {
        itemtap: function(dataView, index, item, e) {
          Crave.back_stack.push({
            panel: listPnl
          });
          //dish_or_place_display
        }
      }
    });
*/

    var infoPnl = new Ext.Panel({
      html: '',
      id: 'infoPnl',
      width:'100%'
    });

    var restMapPnl = new Ext.Panel ({
      items: [
      {
        id: 'googleMap',
        xtype: 'map',
        useCurrentLocation: false,
        height:100,
        width:100,
        mapOptions : {
          center : new google.maps.LatLng(37.774518,-122.420101),  //SF
          //not really centering here, just putting it in top right corner
          zoom : 17,
          mapTypeId : google.maps.MapTypeId.ROADMAP,
          disableDefaultUI: true,
          navigationControl: false
        }
      }
      ],
      height:100,
      width:100
    });
    var restInfoPnl = new Ext.Panel({
      html: '',
      id: 'restInfoPnl',
      flex: 1
    });
    var restPnl = new Ext.Panel({
      id: 'restPnl',
      layout: 'hbox',
      items:[restMapPnl,restInfoPnl],
      width:'100%',
      height:100
    });

    var reviewPnl = new Ext.Panel({
      html: '',
      scroll: 'vertical',
      id: 'reviewPnl'
    });
   
    detailPnl = new Ext.Panel({
      items: [infoPnl,reviewPnl],
      id: 'detailPnl',
      layout: {
        type: 'vbox',
        align: 'start',
        direction: 'normal'
      },
      scroll:'vertical',
      width:'100%',
      height:'100%',
      dockedItems: Crave.create_titlebar({
        items:[{
          text:'Back',
          ui:'back',
          handler: Crave.back_handler
        },{
          text:'Rate',
          ui:'normal',
          handler: function() {
            Crave.back_stack.push({
              panel: detailPnl
            });
            Crave.viewport.setActiveItem(Crave.rateDishPanel);
          }
        }]
      })
    });

    //intentionally not using var to make this global
    listPnl = new Ext.Panel({
      title:'Nearby',
      iconCls:'nearBy',
      id: 'listPnl',
      items: [dishList,placesList,searchPnl,newRestaurant],
      layout: {
        type: 'card'
      },
      width:'100%',
      height:'100%',
      direction:'horizontal',
      dockedItems: [{
        id: 'topPanel',
        xtype: 'toolbar',
        ui:'light',
        dock: 'top',
        layout:{
          pack:'center'
        },
        items:[{
          xtype:'segmentedbutton',
          items:[{
            text:'Food',
            id:'dishesButton',
            pressed:true,
            handler:function () {
              listPnl.setActiveItem(dishList);
            },
            ui:'round',
            width:'100'
          },{
            text:'Places',
            id:'placesButton',
            pressed:false,
            handler:function () {
              listPnl.setActiveItem(placesList);
            },
            ui:'round',
            width:'100'
          }]
        },{
          xtype:'button',
          iconCls:'filtersButton',
          handler: function() {
            Crave.back_stack.push({
              panel: listPnl, 
              anim: {
                type: 'slide', 
                direction: 'down'
              }
            });
            Crave.viewport.setActiveItem(filterListPnl, {type: 'slide', direction: 'up'});
          }
        }]
      },searchForm
      ]
    });

    placePnl = new Ext.Panel({
      id: 'placePnl',
      scroll: 'vertical',
      items: [restPnl, aRestaurantList],
      layout: {
        type: 'vbox',
        align: 'start',
        direction: 'normal'
      },
      dockedItems:[
      {
        dock:'top',
        xtype:'toolbar',
        ui:'light',
        title:'<img class="cravelogo" src="../images/crave-logo-horizontal-white.png">',
        items:[{
          text:'Back',
          ui:'back',
          handler: Crave.back_handler
        }]
      }]
    });

    Crave.myProfilePanel = Crave.buildProfilePanel(true);
    Crave.otherProfilePanel = Crave.buildProfilePanel(false);

    Crave.viewport = new Ext.Panel({
      fullscreen: true,
      layout: 'card',
      activeItem: 0,
      items: [listPnl, Crave.buildSavedPanel(), Crave.activityPanel, Crave.myProfilePanel, detailPnl, filterListPnl,  
        placePnl, newDishForm, Crave.buildRateDishPanel(),
        Crave.buildDishDisplayPanel(), Crave.buildSettingsPanel(),  Crave.otherProfilePanel],
      cardSwitchAnimation: 'slide',
      direction:'horizontal',
      dockedItems: [new Ext.TabBar({
        dock: 'bottom',
        //xtype: 'toolbar',
        cardSwitchAnimation: 'slide',
        id: 'mainTabbar',
        ui: 'dark',
        layout: {
          pack: 'center'
        }, 
        items: [{
          text: 'Nearby', 
          iconCls: 'nearBy',
          card: listPnl
        },{
          text: "Saved",
          iconCls: 'saved',
          card: Crave.savedPanel
        },{
          text: "Activity",
          iconCls: 'activity', 
          card: Crave.activityPanel
        },{
          text: "Me",
          iconCls: 'me',
          card: Crave.myProfilePanel
        }],
        listeners: {
          change: function(tabbar, tab, card) {
            Crave.back_stack = []; //clear back stack when they explicitly click a tab
            if(tab.text === "Me") {
              Crave.myProfilePanel.setActiveItem(1); //reset to profile page since we cleared the back stack.  this is ugly
            }
          }
        }
      })],
      listeners: {
        afterlayout: function(viewport) {
          var tb = Ext.getCmp('mainTabbar');
          tb.cardLayout = viewport.layout;
        }
      }
    });
    $(".startuppic").remove();
  }
});


Crave.updateLocation = function(callback) {
  navigator.geolocation.getCurrentPosition(function(position) {
    var coords = position.coords;
    if(window.location.toString().indexOf("local")>-1) {
      coords = {
        latitude: 37.77867,
        longitude: -122.39127
      };
    }
    Crave.latest_position = coords;
    
    if (callback) {
      callback(coords);
    }
  }, function() {
    //failure handler
    console.log("no location available: using sanfran");
    alert("We couldn't find your location so we're showing results near San Fransisco.")
    Crave.latest_position = {
      latitude: 37.77494,
      longitude: -122.41958
    };
    if (callback) {
      callback(Crave.latest_position);
    }
  });
}
