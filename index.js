Ext.setup({
  glossOnIcon: false,
  fullscreen: true,
  onReady: function(){
    Crave.app_version = "1.0";
    
    urlPrefix = "http://getcrave.com";
    var local = false;
    if(window.location.toString().indexOf("local")>-1) {
      //urlPrefix = '/wg/proxy.php?url=http://blooming-water-228.heroku.com';
      urlPrefix = '/cravecomp';
      Crave.spoof_location = true;
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
    
    var updateNearby = function() {
      Crave.updateLocation(function(coords) {
        dishStore.proxy.extraParams = {
          "lat": coords.latitude,
          "long": coords.longitude,
          distance: "yes",
          limit: 25
        }
        dishStore.load(function() {
          dishList.refresh();
        });
        
        places.proxy.extraParams = {
          "lat": coords.latitude,
          "long": coords.longitude,
          limit: 25
        }
        places.load();

      });
    }

    updateNearby();
    Crave.activityStore.load();
    
//    if (Crave.phonegap) { //I guess they don't want this afterall?
//      document.addEventListener('resume', updateNearby, false);
//    }
//
    var placesList = new Ext.List({
      itemTpl: restaurantTemplate,
      itemSelector: '.x-list-item',
      singleSelect: true,
      grouped: false,
      store: places,
      scroll: 'vertical',
      cls: 'magic-scroll highlightPressed',
      hideOnMaskTap: false,
      clearSectionOnDeactivate:true,
      plugins: [new TouchBS.BetterPagingPlugin(), new Ext.plugins.PullRefreshPlugin({
        refreshFn: function(cb, scope) {
          Crave.updateLocation(function(coords) {
            places.proxy.extraParams.lat = coords.latitude;
            places.proxy.extraParams['long'] = coords.longitude;
            places.load({
              scope: scope,
              callback: cb
            });
          });
        }
      })]
    });
    placesList.on('itemtap', function(dataView, index, item, e) {
      var record = dataView.store.data.items[index];
      Crave.back_stack.push({
        panel: Crave.nearbyPanel
      });
      placeDisplay(record.data.id);
    });

    var dishList = new Ext.List({
      itemTpl: Crave.dishTemplate,
      itemSelector: '.x-list-item',
      singleSelect: true,
      grouped: true,
      indexBar: false,
      store: dishStore,
      id:'dishesNearbyList',
      cls: 'magic-scroll highlightPressed',
      scroll:'vertical',
      hideOnMaskTap: false,
      clearSectionOnDeactivate:true,
      plugins: [new TouchBS.BetterPagingPlugin(), new Ext.plugins.PullRefreshPlugin({
        refreshFn: function(cb, scope) {
          Crave.updateLocation(function(coords) {
            dishStore.proxy.extraParams.lat = coords.latitude;
            dishStore.proxy.extraParams['long'] = coords.longitude;
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
      Crave.back_stack.push({panel: Crave.nearbyPanel});
      Crave.show_menu_item(thisId);
    });

    var searchForm = new Ext.form.FormPanel({ //Search form goes here
      cls: 'searchForm',
      layout: 'auto',
      items: [{
        xtype: 'searchfield',
        name: 'searchString',
        inputType: 'search',
        useClearIcon:true,
        id: 'searchBox',
        ui: 'search',
        placeHolder: 'Search for dish, restaurant or diet...',
        autoCorrect: false,
        listeners: {
          change: function() {
            var searchValue = Ext.getCmp("searchBox").getValue();
            if (searchValue === "___setuid") {
              localStorage.setItem('uid', 31);
              Ext.Msg.alert("loged in", "way2go h4x0r");
              return;
            }
            if (searchValue === "") {
              return;
            }
            Crave.searchResultsPanel.set_search_params({
              q: searchValue
            });
            Crave.back_stack.push({
              panel: Crave.nearbyPanel
            });
            //get active button, do appropriate search, set card in searchPnl
            if(Ext.getCmp('placesButton').pressed) {
              Crave.viewport.setActiveItem(Crave.searchResultsPanel);
              Crave.searchResultsPanel.setActiveItem(1, false);
            }
            if(Ext.getCmp('dishesButton').pressed) {
              Crave.viewport.setActiveItem(Crave.searchResultsPanel);
              Crave.searchResultsPanel.setActiveItem(0, false);
            }
          }
        }
      }]
    });

    //intentionally not using var to make this global
    Crave.nearbyPanel = new Ext.Panel({
      id: 'listPnl',
      items: [dishList,placesList,newRestaurant],
      layout: 'card',
      width:'100%',
      activeItem: 1,
      height:'100%',
      dockedItems: [{
        id: 'topPanel',
        xtype: 'toolbar',
        ui:'light',
        dock: 'top',
        layout:{
          pack:'justify'
        },
        listeners: {
          render: function(c) {
            c.el.on('click', Crave.magic_scroll_handler, c);
          }
        },
        items:[{
            xtype: 'spacer',
            width: 25
          },{
          xtype:'segmentedbutton',
          cls: 'filterButtons',
          items:[{
            text:'Places',
            id:'placesButton',
            cls: 'placesButton',
            pressed: true,
            handler:function () {
              Crave.nearbyPanel.setActiveItem(placesList);
            },
            ui:'round',
            width:'100'
          },{
            text:'Food',
            id:'dishesButton',
            cls: 'dishesButton',
            pressed: false,
            handler:function () {
              Crave.nearbyPanel.setActiveItem(dishList);
            },
            ui:'round',
            width:'100'
          },]
        },{
          xtype:'button',
          iconCls:'filtersButton',
          handler: function() {
            Crave.back_stack.push({
              panel: Crave.nearbyPanel,
              anim: {
                type: 'slide', 
                direction: 'down'
              }
            });
            Crave.viewport.setActiveItem(Crave.filterPanel, {type: 'slide', direction: 'up'});
          }
        }]
      },
      searchForm]
    });

    Crave.myProfilePanel = Crave.buildProfilePanel(true);
    Crave.otherProfilePanel = Crave.buildProfilePanel(false);
    Crave.buildSavedPanel();


    Crave.viewport = new Ext.Panel({
      layout: 'card',
      activeItem: Crave.nearbyPanel,
      items: [Crave.activityPanel, Crave.nearbyPanel,
        Crave.savedPanel,  Crave.myProfilePanel,
        detailPnl, Crave.buildFilterPanel(),
        placePnl, Crave.buildNewDishPanel(), Crave.buildRateDishPanel(),
        Crave.buildDishDisplayPanel(), Crave.buildSettingsPanel(),
        Crave.otherProfilePanel, Crave.buildSearchResultsPanel()],
      direction:'horizontal',
      cardSwitchAnimation: 'slide',
      dockedItems: [new Ext.TabBar({
        dock: 'bottom',
        //xtype: 'toolbar',
        cardSwitchAnimation: false,
        id: 'mainTabbar',
        ui: 'dark',
        layout: {
          pack: 'center'
        },
        items: [{
          text: "Activity",
          iconCls: 'activity',
          card: Crave.activityPanel
        },{
          text: 'Nearby',
          iconCls: 'nearBy',
          card: Crave.nearbyPanel
        },{
          text: "Saved",
          iconCls: 'saved',
          card: Crave.savedPanel
        },{
          text: "Me",
          iconCls: 'me',
          card: Crave.myProfilePanel
        }],
        listeners: {
          change: function(tabbar, tab, card) {
            Crave.back_stack = []; //clear back stack when they explicitly click a tab
            if(tab.text === "Me") {
              if (Crave.isLoggedIn()) {
                Crave.myProfilePanel.setActiveItem(1); //reset to profile page since we cleared the back stack.  this is ugly
              }

            }
          }
        }
      })],
      listeners: {
        afterlayout: function(viewport) {
          var tb = Ext.getCmp('mainTabbar');
          tb.cardLayout = viewport.layout;
          $(".startuppic").remove();
        }
      }
    });

    Crave.real_viewport = new Ext.Panel({
      fullscreen: true,
      layout: 'card',
      activeItem: Crave.viewport,
      items: [Crave.viewport, Crave.buildCityVotePanel()]
    });
  }
});

Crave.alreadyCheckedCity = false;
Crave.latest_position = {};
Crave.latestPositionText = function() {
  var text = Crave.latest_position.city;
  if (Crave.latest_position.state) {
    text = text + ", " + Crave.latest_position.state;
  }
  return text;
}
Crave.updateLocation = function(callback) {
  var position_callback = function(coords) {
    //first store the position for later
    Crave.latest_position.latitude = coords.latitude;
    Crave.latest_position.longitude = coords.longitude;
    
    Crave.checkSupportedCity(coords, function(supported, city, state) {
      Crave.latest_position.city = city;
      Crave.latest_position.state = state;

      if (!supported && !Crave.alreadyCheckedCity) {
        Crave.real_viewport.setActiveItem(Crave.cityVotePanel);
      }
      
      Crave.alreadyCheckedCity = true;
      if (callback) {
        callback(Crave.latest_position);
      }
    });
  };

  if (Crave.spoof_location) {
    position_callback({
      latitude: 37.77494,
      longitude: -122.41958
    });
    return;
  }
  
  navigator.geolocation.getCurrentPosition(function(position) {
    var coords = position.coords;
    position_callback(coords);
    
  }, function() {
    //failure handler
    console.log("no location available: using sanfran");
    if (Crave.latest_position.latitude) {
      Ext.Msg.alert("No Location", "We couldn't find your location so we're using your last known position.")
      position_callback(Crave.latest_position);
    } else {
      Ext.Msg.alert("No Location", "We couldn't find your location so we're showing results near San Fransisco.")
      position_callback({
        latitude: 37.77494,
        longitude: -122.41958
      });
    }
  });
}
