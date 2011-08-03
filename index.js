Ext.setup({
  glossOnIcon: false,
  fullscreen: false,
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
    
    updateNearby = function() {
      Crave.updateLocation(function(coords) {
        dishStore.proxy.extraParams = {
          "lat": coords.latitude,
          "long": coords.longitude,
          distance: "yes",
          limit: 25
        }
        dishStore.load();
        
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
    if (Crave.phonegap) {
      document.addEventListener('resume', updateNearby, false);
    }
    
    var placesList = new Ext.List({
      itemTpl: restaurantTemplate,
      itemSelector: '.aplace',
      singleSelect: true,
      grouped: false,
      store: places,
      scroll: 'vertical',
      cls: 'magic-scroll',
      hideOnMaskTap: false,
      clearSectionOnDeactivate:true,
      plugins: [new Ext.plugins.ListPagingPlugin(), new Ext.plugins.PullRefreshPlugin({
        refreshFn: function(cb, scope) {
          Crave.updateLocation(function(coords) {
            places.proxy.extraParams.lat = coords.latitude;
            places.proxy.extraParams.lon = coords.longitude;
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
      cls: 'magic-scroll',
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

   
    
    //intentionally not using var to make this global
    listPnl = new Ext.Panel({
      id: 'listPnl',
      items: [dishList,placesList,searchPnl,newRestaurant],
      layout: 'card',
      width:'100%',
      activeItem: 0,
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
      },
      searchForm]
    });

    Crave.myProfilePanel = Crave.buildProfilePanel(true);
    Crave.otherProfilePanel = Crave.buildProfilePanel(false);

    TouchBS.init_viewport(function() {
      Crave.viewport = new Ext.Panel({
        layout: 'card',
        fullscreen: true,
        activeItem: listPnl,
        items: [Crave.activityPanel, listPnl, Crave.buildSavedPanel(),  Crave.myProfilePanel, detailPnl, filterListPnl,
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
            text: "Activity",
            iconCls: 'activity',
            card: Crave.activityPanel
          },{
            text: 'Nearby',
            iconCls: 'nearBy',
            card: listPnl
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
                Crave.myProfilePanel.setActiveItem(1); //reset to profile page since we cleared the back stack.  this is ugly
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
    });
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