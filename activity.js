/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */


Crave.activityStore = new Ext.data.Store({
  model: 'MenuItemRating',
  clearOnPageLoad: false,
  proxy: {
    type:'ajax',
    extraParams: Crave.isLoggedIn() ? {} : {all: true},
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
        pressed: Crave.isLoggedIn() ? true : false,
        handler:function() {
          delete Crave.activityStore.proxy.extraParams.all;
          Crave.activityStore.load(function() {
            Ext.getCmp('activityList').scroller.scrollTo({x: 0, y: 0}, false, null, true);
          });
          
        },
        ui:'round',
        width:'110'
      },{
        text:'All Foodies',
        pressed: Crave.isLoggedIn() ? false : true,
        handler:function() {
          Crave.activityStore.proxy.extraParams.all = "true";
          Crave.activityStore.load(function() {
            Ext.getCmp('activityList').scroller.scrollTo({x: 0, y: 0}, false, null, true);
          });
        },
        ui:'round',
        width:'110'
      }]
    }]
  }],
  items: {
    xtype: 'list',
    id: 'activityList',
    itemTpl: new Ext.XTemplate.from('ratingTemplate',{
      ratingDisplay: Crave.ratingDisplay
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

