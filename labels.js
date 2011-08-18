//simple list of labels
Crave.buildLabelListPanel = function(title) {
  var filterStore = new Ext.data.Store({
    model  : 'MenuLabel',
    sorters: 'menu_label',
    proxy: {
      type: 'ajax',
      url: '/menu_labels.json',
      reader: {
        type: 'json',
        record: 'menu_label'
      }
    },
    autoLoad: true,
    old: [{label: 'Gluten Free'},
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
  var list = new Ext.List({
      scroll: false,
      loadingText: "Loading",
      cls: 'labelList highlightPressed',
      itemTpl : '<span class="labelname">{menu_label}</span>',
      grouped : false,
      multiSelect: true,
      simpleSelect:true,
      indexBar: false,
      store: filterStore
  });
  var dockedItems;
  if (title) {
    dockedItems = [{
      dock : 'top',
      xtype: 'toolbar',
      cls: 'title',
      title: title
    }];
  }
  return new Ext.Panel({
    xtype: 'panel',
    cls: 'framePanel',
    //height: 710,
    dockedItems: dockedItems,
    items: list,
    getSelectedRecords: function() {
      return list.getSelectedRecords();
    },
    setSelectedRecords: function(records) {
      return list.getSelectionModel().select(records, false, true);
    },
    get_filters: function() {
      var filters = list.getSelectedRecords();
      var filter_names = [];
      Ext.each(filters, function(f) {
        filter_names.push(f.data.menu_label);
      })
      return filter_names;
    },
    clear_filters: function() {
       list.getSelectionModel().deselectAll();
    }
  });
};

//This panel you can set a menu item on and it will add labels to a menu item and then call backhandler
//pass in a success callback pls and a cancel_callback if you want
Crave.buildAddLabelPanel = function(config) {

  var cancel_callback = config.cancel_callback || Crave.back_handler;
  var cancel_label = config.cancel_label || "Cancel";

  var labelList = Crave.buildLabelListPanel();
  var labelsPanel = new Ext.Panel({
    width: '100%',
    scroll: 'vertical',
    bodyStyle: 'padding: 0 .5em 0 .5em;',
    dockedItems: Crave.create_titlebar({
      title: "Add a Label",
      items: [{
        text: cancel_label,
        handler: function() {
          labelList.clear_filters();
          cancel_callback();
        }
      }, {
        text: "Submit",
        handler: function() {
          TouchBS.wait("Please wait");
          Ext.each(labelList.getSelectedRecords(), function(label) {
            Ext.Ajax.request({
              method: 'POST',
              url: '/menu_label_associations.json',
              jsonData: {
                menu_label_association: {
                  menu_item_id: labelsPanel.current_menu_item_id,
                  user_id: Crave.currentUserId(),
                  menu_label_id: label.data.id
                }
              },
              success: function() {

              },
              failure: TouchBS.handle_failure
            });
          });
          labelList.clear_filters();
          TouchBS.stop_waiting();
          config.success_callback();
        }
      }]
    }),
    items: labelList,
    set_menu_item: function (menu_item) {
      labelsPanel.current_menu_item_id = menu_item.id;
    }
  });

  return labelsPanel;
};