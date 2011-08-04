Crave.buildSearchResultsPanel = function() {
  var dishSearchStore = new Ext.data.Store({
    model: 'Dish',
    clearOnPageLoad: false,
    proxy: {
      type:'ajax',
      url:'/items/search.json',
      extraParams: {
        distance: 'yes'
      },
      reader: {
        type:'json',
        record: 'menu_item'
      }
    }
  });

  var dishSearchList = new Ext.List({
    itemTpl: Ext.XTemplate.from('reviewDishTemplate'),
    singleSelect: true,
    itemSelector: '.adish',
    grouped: false,
    indexBar: false,
    store: dishSearchStore,
    loadingText: "Loading",
    clearSectionOnDeactivate:true,
    scroll:'vertical',
    listeners: {
      activate: function(p) {
        dishSearchStore.load();
        dishSearchList.refresh();
        segButton.setPressed(1);
      }
    },
    plugins: [new Ext.plugins.ListPagingPlugin({}), new Ext.plugins.PullRefreshPlugin({})]
  });

  dishSearchList.on('itemtap', function(dataView, index, item, e) {
    var record = dataView.store.data.items[index];
    Crave.back_stack.push({
      panel: Crave.searchResultsPanel
    });
    Crave.show_menu_item(record.data.id);
  });

  var restaurantSearchStore = new Ext.data.Store({
    model: 'Restaurant',
    id: 'restaurants',
    clearOnPageLoad: false,
    extraParams: {
      
    },
    proxy: {
      type:'ajax',
      url:'/places/search.json',
      reader: {
        type:'json',
        record: 'restaurant'
      }
    }
  });
  var restaurantSearchList = new Ext.List({
    itemTpl: restaurantTemplate,
    singleSelect: true,
    itemSelector: '.aplace',
    grouped: false,
    indexBar: false,
    clearSectionOnDeactivate:true,
    store: restaurantSearchStore,
    listeners: {
      activate: function(p) {
        restaurantSearchStore.load();
        restaurantSearchList.refresh();
        segButton.setPressed(2);
      }
    },
    plugins: [new Ext.plugins.ListPagingPlugin({}), new Ext.plugins.PullRefreshPlugin({})]
  });

  restaurantSearchList.on('itemtap', function(dataView, index, item, e) {
    var record = dataView.store.data.items[index];
    Crave.back_stack.push({
      panel: Crave.searchResultsPanel
    });
    Crave.show_restaurant(record.data.id);
  });

  var bothStore = new Ext.data.Store({
    model: 'Both',
    clearOnPageLoad: false,
    sorters: [{property: 'arating', direction: 'ASC'}],
    getGroupString : function(record) {
      if (record.data.menu_item) {
        return Crave.ratingDisplay(record.data.menu_item.menu_item_avg_rating_count.avg_rating);
      } else {
        return "Restaurant";
      }
    },
    proxy: {
       type:'ajax',
       url: '/items/nearby.json',
       reader: {
         type:'json'
       }
    }
  });

  var bothList = new Ext.List({
    itemTpl: Ext.XTemplate.from('searchResultTemplate'),
    itemSelector: '.item',
    singleSelect: true,
    grouped: true,
    indexBar: false,
    store: bothStore,
    scroll:'vertical',
    hideOnMaskTap: false,
    clearSectionOnDeactivate:true,
    plugins: [new Ext.plugins.ListPagingPlugin(), new Ext.plugins.PullRefreshPlugin({})],
    listeners: {
      itemtap: function(dataView, index, item, e) {
        Crave.back_stack.push({
          panel: Crave.searchResultsPanel
        });
        var record = bothStore.getAt(index);
        if (record.data.menu_item) {
          Crave.show_menu_item(record.data.menu_item.id);
        } else {
          Crave.show_restaurant(record.data.restaurant.id);
        }
      },
      activate: function(p) {
        bothStore.load();
        segButton.setPressed(0);
      }
    }
  });
  var searchForm = new Ext.form.FormPanel({
    cls: 'searchForm',
    layout: 'auto',
    items: [{
      xtype: 'searchfield',
      name: 'searchString',
      inputType: 'search',
      useClearIcon:true,
      ui: 'search',
      placeHolder: 'Search for dish, restaurant or diet...',
      listeners: {
        change: function(t, searchValue, oldValue) {
          Crave.searchResultsPanel.set_search_params({
            q: searchValue
          });
          
          Crave.searchResultsPanel.getActiveItem().getStore().load();
        }
      }
    }]
  });

  var segButton = new Ext.SegmentedButton({
    items:[{
      text:'All',
      pressed:true,
      handler:function () {
        Crave.searchResultsPanel.setActiveItem(bothList);
      },
      ui:'round',
      width:'50'
    },{
      text:'Food',
      pressed:false,
      handler:function () {
        Crave.searchResultsPanel.setActiveItem(dishSearchList);
      },
      ui:'round',
      width:'50'
    },{
      text:'Places',
      pressed:false,
      handler:function () {
        Crave.searchResultsPanel.setActiveItem(restaurantSearchList);
      },
      ui:'round',
      width:'75'
    }]
  });

  Crave.searchResultsPanel = new Ext.Panel({
    layout:'card',
    width:'100%',
    defaults: {
      anchor: '100%',
      height: '100%'
    },
    dockedItems: [Crave.create_titlebar({
      items:[{
        text: 'Back',
        ui: 'back',
        handler: Crave.back_handler
      },segButton,{
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
    }),searchForm],
    activeItem: 0,
    items: [bothList, dishSearchList,restaurantSearchList],
    set_search_params: function(search) {
      dishSearchStore.proxy.extraParams = Ext.apply({
        lat: Crave.latest_position.latitude,
        "long": Crave.latest_position.longitude,
        distance: true
      }, search);

      restaurantSearchStore.proxy.extraParams = Ext.apply({
        lat: Crave.latest_position.latitude,
        "long": Crave.latest_position.longitude,
        distance: true
      }, search);

      bothStore.proxy.extraParams = Ext.apply({
        lat: Crave.latest_position.latitude,
        "long": Crave.latest_position.longitude,
        distance: true
      }, search);
      
      var activePanel = Crave.searchResultsPanel.getActiveItem();
      if (activePanel) {
        activePanel.getStore().load();
      }

      searchForm.items.get(0).setValue(search.q);
    },
    listeners: {
      activate: function(p) {
       
      }
    }
  });

  return Crave.searchResultsPanel;
};

Crave.buildFilterPanel = function() {
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
  var distancePanel = new Ext.Panel({
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

  var labelList = Crave.buildLabelListPanel("Dietary Preference");
  Crave.filterPanel = new Ext.Panel({
    items: [distancePanel, labelList],
    id: 'filterListPnl',
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
        handler:function(b,e) {
          var dfb = Ext.getCmp('distanceFilterButton').getPressed();
          Crave.searchResultsPanel.set_search_params({
            q: labelList.get_filters().join(' '),
            d: dfb.filter_value
          });
          Crave.viewport.setActiveItem(Crave.searchResultsPanel);
          //specifically not calling back_handler to preserve it for search panel
        }
      }]
    }]
  });

  return Crave.filterPanel;
};