Crave = new Ext.Application({
	name: "Crave",
	
	launch: function(){
		this.views.viewport = new this.views.Viewport();
	}
});