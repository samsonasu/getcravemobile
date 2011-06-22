Crave.controllers.nearby = new Ext.Controller({
		showDishes: function(options) {
		   Ext.getCmp('nearby').setActiveItem(0);
		   
			
		},
    	showRes: function(options) {
			//Ext.Msg.alert('sh','sh',Ext.emptyFn);
			Ext.getCmp('nearby').setActiveItem(1);	
		},
		showDish : function(options) {
			Ext.getCmp('nearby').setActiveItem(2);
		}
});