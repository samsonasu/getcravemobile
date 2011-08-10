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
    },
    listeners: {
      load: function() {
        update_status(dishSearchStore.getCount());
        dishSearchList.scroller.scrollTo({x: 0, y:0});
      }
    }
  });

  var dishSearchList = new Ext.List({
    itemTpl: Ext.XTemplate.from('reviewDishTemplate'),
    singleSelect: true,
    itemSelector: '.x-list-item',
    grouped: false,
    indexBar: false,
    store: dishSearchStore,
    loadingText: "Loading...",
    cls: 'magic-scroll highlightPressed',
    clearSectionOnDeactivate:true,
    scroll:'vertical',
    listeners: {
      activate: function(p) {
        dishSearchStore.load();
        dishSearchList.refresh();
        segButton.setPressed(0, false);
        segButton.setPressed(1, true);
      }
    }
    //plugins: [new Ext.plugins.PullRefreshPlugin({})]
  });

  dishSearchList.on('itemtap', function(dataView, index, item, e) {
    var record = dataView.store.data.items[index];
    Crave.back_stack.push({
      panel: Crave.searchResultsPanel
    });
    Crave.show_menu_item(record.data.id);
  });

  var update_status = function(result_count) {
    var status = result_count + " results in " + Crave.latestPositionText();
    if (Crave.searchResultsPanel.search_query) {
      status += " for '" + Crave.searchResultsPanel.search_query + "'";
    }
    if (Crave.searchResultsPanel.active_filters && Crave.searchResultsPanel.active_filters.length > 0) {
      status += " [" + Crave.searchResultsPanel.active_filters.join(', ') + ']';
    }
    
    search_status.update({
      status: status
    });
  }

  var restaurantSearchStore = new Ext.data.Store({
    model: 'Restaurant',
    id: 'restaurants',
    clearOnPageLoad: false,
    extraParams: {
      
    },
    proxy: {
      type:'ajax',
      url:'/places/search.json',
      extraParams: {
        distance: 'yes'
      },
      reader: {
        type:'json',
        record: 'restaurant'
      }
    },
    listeners: {
      load: function() {
        update_status(restaurantSearchStore.getCount());
        restaurantSearchList.scroller.scrollTo({x: 0, y:0});
      }
    }
  });
  var restaurantSearchList = new Ext.List({
    itemTpl: Ext.XTemplate.from('restaurantSearchTemplate'),
    singleSelect: true,
    itemSelector: '.x-list-item',
    grouped: false,
    indexBar: false,
    cls: 'magic-scroll highlightPressed',
    clearSectionOnDeactivate:true,
    store: restaurantSearchStore,
    loadingText: "Loading...",
    listeners: {
      activate: function(p) {
        search_status.update({
          status: "Searching..."
        });
        restaurantSearchStore.load(function() {
          update_status(restaurantSearchStore.getCount());
        });
        restaurantSearchList.refresh();
        
        segButton.setPressed(0, true);
        segButton.setPressed(1, false);
        
      }
    }
    //plugins: [new Ext.plugins.PullRefreshPlugin({})]
  });

  restaurantSearchList.on('itemtap', function(dataView, index, item, e) {
    var record = dataView.store.data.items[index];
    Crave.back_stack.push({
      panel: Crave.searchResultsPanel
    });
    Crave.show_restaurant(record.data.id);
  });

//  var bothStore = new Ext.data.Store({
//    model: 'Both',
//    clearOnPageLoad: false,
//    sorters: [{property: 'arating', direction: 'ASC'}],
//    getGroupString : function(record) {
//      if (record.data.menu_item) {
//        return Crave.ratingDisplay(record.data.menu_item.menu_item_avg_rating_count.avg_rating);
//      } else {
//        return "Restaurant";
//      }
//    },
//    proxy: {
//       type:'ajax',
//       url: '/items/nearby.json',
//       reader: {
//         type:'json'
//       }
//    }
//  });
//
//  var bothList = new Ext.List({
//    itemTpl: Ext.XTemplate.from('searchResultTemplate'),
//    itemSelector: '.item',
//    singleSelect: true,
//    grouped: true,
//    indexBar: false,
//    store: bothStore,
//    scroll:'vertical',
//    hideOnMaskTap: false,
//    loadingText: "Loading...",
//    clearSectionOnDeactivate:true,
//    plugins: [new Ext.plugins.ListPagingPlugin(), new Ext.plugins.PullRefreshPlugin({})],
//    listeners: {
//      itemtap: function(dataView, index, item, e) {
//        Crave.back_stack.push({
//          panel: Crave.searchResultsPanel
//        });
//        var record = bothStore.getAt(index);
//        if (record.data.menu_item) {
//          Crave.show_menu_item(record.data.menu_item.id);
//        } else {
//          Crave.show_restaurant(record.data.restaurant.id);
//        }
//      },
//      activate: function(p) {
//        bothStore.load();
//        segButton.setPressed(0, true);
//      }
//    }
//  });

  var doTextSearch = function() {
    Crave.searchResultsPanel.set_search_params({
      q: search_field.getValue()
    });
    var item = Crave.searchResultsPanel.getActiveItem();
    item.setLoading(true);
    item.getStore().load({
      callback: function(){
        item.setLoading(false);
      }
    });
    return false;
  }
  
  var search_field = new Ext.form.Text({
    xtype: 'searchfield',
    name: 'searchString',
    inputType: 'search',
    useClearIcon:true,
    width: '100%',
    ui: 'search',
    placeHolder: 'Search for dish, restaurant or diet...',
    autoCorrect: false,
    listeners: {
      change: doTextSearch
    }
  });

  var search_status = new Ext.Panel({
    border: false,
    height: 20,
    width: '100%',
    data: {status: "test"},
    tpl: "<div class='searchStatus'>{status}</div>"
  });
 
  var searchForm = new Ext.form.FormPanel({
    cls: 'searchForm',
    layout: 'vbox',
    height: 66,
    width: "100%",
    items: [search_field, search_status],
    listeners: {
      beforesubmit: doTextSearch
    }
  });

  var segButton = new Ext.SegmentedButton({
    cls: 'filterButtons',
    allowDepress: true,
    
    items:[
//      {
//      text:'All',
//      pressed:true,
//      handler:function () {
//        Crave.searchResultsPanel.setActiveItem(bothList);
//      },
//      ui:'round',
//      width:'50'
//    },
    {
      text:'Places',
      cls: 'placesButton',
      pressed: true,
      handler:function () {
        Crave.searchResultsPanel.setActiveItem(restaurantSearchList);
      },
      ui:'round',
      width: 100
    },{
      text:'Food',
      cls: 'dishesButton',
      pressed: false,
      handler:function () {
        Crave.searchResultsPanel.setActiveItem(dishSearchList);
      },
      ui:'round',
      width: 100
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
        ui: 'iback',
        handler: Crave.back_handler
      },segButton,{
        xtype:'button',
        iconCls:'filtersButton',
        handler: function() {
          Crave.back_stack.push({
            panel: Crave.searchResultsPanel,
            anim: {
              type: 'slide',
              direction: 'down'
            }
          });
          Crave.viewport.setActiveItem(Crave.filterPanel, {type: 'slide', direction: 'up'});
        }
      }]
    }),searchForm],
    activeItem: 1,
    items: [dishSearchList, restaurantSearchList],
    active_filters: [],
    search_radius: "",
    search_query: "",
    set_search_params: function(search) {
      if (search.filters) {
        Crave.searchResultsPanel.active_filters = search.filters;
      }

      if (search.d) {
        Crave.searchResultsPanel.search_radius = search.d;
      }

      if (search.q !== undefined) {
        Crave.searchResultsPanel.search_query = search.q;
      }

      var params = {
         lat: Crave.latest_position.latitude,
        "long": Crave.latest_position.longitude,
        q: Crave.searchResultsPanel.search_query + " " + Crave.searchResultsPanel.active_filters.join(' '),
        d: Crave.searchResultsPanel.search_radius
      }
      dishSearchStore.proxy.extraParams = Ext.apply({}, params);
      restaurantSearchStore.proxy.extraParams = Ext.apply({}, params);
      //bothStore.proxy.extraParams = Ext.apply({}, params);
      
      var activePanel = Crave.searchResultsPanel.getActiveItem();
      if (activePanel) {
        //console.log('activePanel found, loading');
        //activePanel.getStore().load();
      }

      search_field.setValue(Crave.searchResultsPanel.search_query);
    },
    listeners: {
      activate: function() {
        Crave.searchResultsPanel.getActiveItem().fireEvent('activate');
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
    bodyStyle: 'padding: 0 .5em 0 .5em;',
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
        handler: function() {
          labelList.setSelectedRecords(Crave.filterPanel.selected_records);
          Crave.back_handler();
        }
      },{
        text:'Search',
        ui:'normal',
        handler:function(b,e) {
          var dfb = Ext.getCmp('distanceFilterButton').getPressed();
          Crave.searchResultsPanel.set_search_params({
            filters: labelList.get_filters(),
            d: dfb.filter_value
          });
          Crave.filterPanel.selected_records = labelList.getSelectedRecords();
          Crave.viewport.setActiveItem(Crave.searchResultsPanel);
          //specifically not calling back_handler to preserve it for search panel
        }
      }]
    }],
    selected_records: []
  });

  return Crave.filterPanel;
};