/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

Ext.regModel("MenuItemRating", {
  fields: ["rating","created_at", "updated_at", "review", "id", "user_id", "menu_item_id", "user", "menu_item"],
  belongsTo: [{
    model: 'Dish',
    name: 'menu_item',
    foreignKey: 'menu_item_id'
  },{
    model: 'User',
    name: 'user'
  }]
});

Crave.activityStore = new Ext.data.Store({
  model: 'MenuItemRating',
  clearOnPageLoad: false,
  proxy: {
    type:'ajax',
    extraParams: {},
    url: '/activity.json',
    reader: {
      type:'json',
      record:'menu_item_rating'
    }
  },
  getGroupString: function(record) {
    return TouchBS.pretty_date(record.get('created_at'));
  }

});

Crave.activityPanel = new Ext.Panel({
  title:'Activity',
  iconCls:'activity',
  id:'activityPnlTab',
  layout: 'fit',
  loadingText: "Loading...",
  dockedItems: [{
    xtype: 'toolbar',
    ui:'light',
    dock: 'top',
    layout:{
      pack:'center'
    },
    items:[{
      xtype:'segmentedbutton',
      items:[{
        text: 'Following',
        pressed: true,
        handler:function() {
          Crave.activityPanel.setLoading(true);
          delete Crave.activityStore.proxy.extraParams.all;
          Crave.activityStore.load(function() {
            Crave.activityPanel.setLoading(false);
          });
        },
        ui:'round',
        width:'110'
      },{
        text:'All',
        pressed: false,
        handler:function() {
          Crave.activityPanel.setLoading(true);
          Crave.activityStore.proxy.extraParams.all = "true";
          Crave.activityStore.load(function() {
            Crave.activityPanel.setLoading(false);
          });
        },
        ui:'round',
        width:'110'
      }]
    }]
  }],
  items: {
    xtype: 'list',
    itemTpl: new Ext.XTemplate.from('ratingTemplate',{
      ratingDisplay: function(rating) {
        return "<img class='stars' src='../images/rating-my-" + rating + ".png' >"
      }
    }),
    itemSelector: '.arating',
    scroll:'vertical',
    loadingText: 'Loading',
    singleSelect: true,
    grouped: true,
    indexBar: false,
    store: Crave.activityStore,
    plugins: [new Ext.plugins.ListPagingPlugin()]
  }
});

