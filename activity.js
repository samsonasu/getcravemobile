Crave.activityStore = new Ext.data.Store({
  model: 'MenuItemRating',
  clearOnPageLoad: false,
  proxy: {
    type:'ajax',
    extraParams: Crave.isLoggedIn() ? {} : {all: true},
    url: Crave.isLoggedIn() ? "/users/" + Crave.currentUserId() + "/following_reviews.json" : '/activity.json',
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
    listeners: {
      render: function(c) {
        c.el.on('click', Crave.magic_scroll_handler, c);
      }
    },
    items:[{
      xtype:'segmentedbutton',
      id: 'whoseActivityButton',
      items:[{
        text: 'Following',
        pressed: Crave.isLoggedIn() ? true : false,
        handler:function(btn) {
          if (!Crave.isLoggedIn()) {
            Ext.Msg.alert("Login", "Please log in to view followers' activity");
            Ext.getCmp('whoseActivityButton').setPressed(1, true, true);
            return;
            
          }
          Crave.activityStore.proxy.url = "/users/" + Crave.currentUserId() + "/following_reviews.json";
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
          Crave.activityStore.proxy.url = "/activity.json";
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
    cls: 'magic-scroll',
    loadingText: 'Loading',
    singleSelect: true,
    grouped: true,
    indexBar: false,
    store: Crave.activityStore,
    plugins: [new Ext.plugins.ListPagingPlugin(), new Ext.plugins.PullRefreshPlugin({})]
  }
});

