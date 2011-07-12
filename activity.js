/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

Ext.regModel("MenuItemRating", {
  fields: ["rating","created_at", "updated_at", "review", "id", "user_id", "menu_item_id"],
  belongsTo: {
    model: 'Dish',
    foreignKey: 'menu_item_id'
  }
});

Crave.activityStore = new Ext.data.JsonStore({
  model: 'MenuItemRating',
  proxy: {
    type:'ajax',
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
        pressed: false,
        ui:'round',
        width:'110'
      },{
        text:'All',
        pressed: true,
        handler:function() {
          Crave.activityStore
        },
        ui:'round',
        width:'110'
      }]
    }]
  }],
  items: {
    xtype: 'list',
    //fullscreen: true,
    itemTpl: new Ext.XTemplate.from('ratingTemplate',{
      ratingDisplay: function(rating) {
        return "<img class='stars' src='../images/rating-my-" + rating + ".png' >"
      }
    }),
    itemSelector: '.arating',
    scroll:'vertical',
    singleSelect: true,
    grouped: true,
    indexBar: false,
    store: Crave.activityStore
  }
});

