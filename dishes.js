Ext.regModel('Filters', {
    fields: ['label']
});
var filterStore = new Ext.data.JsonStore({
    model  : 'Filters',
    sorters: 'label',

    getGroupString : function(record) {
        return record.get('label')[0];
    },

    data: [
        {label: 'Gluten Free'},
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
var filterList = new Ext.List({
    width:'100%',
    height:'100%',
    itemTpl : '<span class="labelname">{label}</span>',
    grouped : false,
    multiSelect: true,
    simpleSelect:true,
    indexBar: false,

    store: filterStore
});
labelString = "";
filterList.on('itemtap', function(dataView, index, item, e) {
    thisLabel = $(".labelname", item).text();
    labelString += " "+thisLabel;
    //alert(labelString);
});
//when youpress search, make json call to search results, repopulate listPnl store
//add distance control button
//add listener to button, add distance parameter to search string

var searchHandler = function(b,e) {
    Ext.getCmp('mainPnl').setActiveItem(1);
    dishSearchStore.proxy.url = urlPrefix+'/items/search.json?q='+labelString;
    dishSearchStore.load();
    console.log(dishSearchStore.proxy.url);
    Ext.getCmp('listPnl').setActiveItem(searchPnl);
    Ext.getCmp('searchPnl').setActiveItem(dishSearchList);
}
var filterListPnl = new Ext.Panel({
    items: [filterList],
//    html: 'hello there',
    id: 'filterListPnl',
    layout: {
        type: 'card'
    },
    width:'100%',
    height:'100%',
    scroll:'vertical',
    dockedItems:[
        {
            dock:'top',
            xtype:'toolbar',
            ui:'light',
            title:'Filters',
             layout: {
                 type: 'hbox',
                 pack:'justify'
             },
            items:[{text:'Cancel',ui:'normal', handler:backHandler},{text:'Search',ui:'normal', handler:searchHandler}]
        }
    ]
});


dishTemplate = new Ext.XTemplate.from('dishesTemplate',
    {distDisplay: function(miles) {
        feet = Math.round(miles * 5280);
        if(feet<1000) {
            return feet+" feet";
        } else {
            return parseFloat(miles).toFixed(1)+' miles';
        }
    }});

Ext.regModel('Dish',
{
    fields: ['name','id','price','description','restaurant_id','restaurant','distance','menu_item_avg_rating_count','avg_rating',{
        name: 'rating',
        convert: function(value, record) {
            if(record.get('menu_item_avg_rating_count').avg_rating) {
                return record.get('menu_item_avg_rating_count').avg_rating.toString();
            } else {
                return "unrated";
            }
        }
    },{
        name: 'restaurant_name',
        convert: function(value, record) {
            return record.get('restaurant').name.toString();
        }
    }]
});

Ext.regModel('savedDish',
{
    fields: ['menu_item','menu_item_avg_rating_count','avg_rating',{
        name: 'rating',
        convert: function(value, record) {
            if(record.get('menu_item').menu_item_avg_rating_count) {
                return record.get('menu_item').menu_item_avg_rating_count.avg_rating.toString();
            } else {
                console.log('one is UNRATED');
                return "unrated";
            }
        }
    },{
        name: 'name',
        convert: function(value, record) {
            return record.get('menu_item').name.toString();
        }
    }]
});

var dishStore = new Ext.data.Store({
    model: 'Dish',
    sorters: [{property: 'arating', direction: 'ASC'}],
    getGroupString : function(record) {
        rating = parseInt(record.get('rating'));
        if(rating==5) {
            return "<img src='../images/rating-stars/rating-dish-5.png'>";
        }
        if(rating==4) {
            return "<img src='../images/rating-stars/rating-dish-4.png'>";
        }
        if(rating==3) {
            return "<img src='../images/rating-stars/rating-dish-3.png'>";
        }
        if(rating==2) {
            return "<img src='../images/rating-stars/rating-dish-2.png'>";
        }
        if(rating==1) {
            return "<img src='../images/rating-stars/rating-dish-1.png'>";
        } else {
            return "unrated";
        }
    },
    proxy: {
        type:'ajax',
        url:'',
       reader: {
           type:'json',
           record:'menu_item'
       }
    }
});

var savedDishStore = new Ext.data.Store({
    model: 'savedDish',
    sorters: [{property: 'rating', direction: 'DESC'}],
    getGroupString : function(record) {
        rating = parseInt(record.get('rating'));
        if(rating==5) {
            return "<img src='../images/rating-stars/rating-dish-5.png'>";
        }
        if(rating==4) {
            return "<img src='../images/rating-stars/rating-dish-4.png'>";
        }
        if(rating==3) {
            return "<img src='../images/rating-stars/rating-dish-3.png'>";
        }
        if(rating==2) {
            return "<img src='../images/rating-stars/rating-dish-2.png'>";
        }
        if(rating==1) {
            return "<img src='../images/rating-stars/rating-dish-1.png'>";
        } else {
            return "?";
        }
    },
    proxy: {
        type:'ajax',
        url:'',
       reader: {
           type:'json',
           record:'user_saved_menu_item'
       }
    }
});

var newDishForm = new Ext.form.FormPanel({
    scroll: 'vertical',
    dockedItems:[
       {
           dock:'top',
           xtype:'toolbar',
           ui:'light',
           title:'Crave',
           items:[{text:'Back',ui:'back', handler:backHandler}]
       }
    ],
    items: [
       {xtype: 'fieldset', title: 'New Restaurant', items: [
            {
                xtype: 'textfield',
                hidden:true,
                name: 'menu_item[restaurant_id]',
                id: 'restaurantId'
		    },
           {
               xtype: 'textfield',
               label:'Name',
               name: 'menu_item[name]',
               id: 'menuItemName'
           },
           {
               xtype: 'textfield',
               label:'Description',
               name: 'menu_item[description]',
               id: 'menuItemDescription'
           },
           {
               xtype: 'textfield',
               hidden:true,
               name: 'menu_item[user_id]',
               id: 'userId'
           },

           {
               xtype:'button',
               text: 'Submit',
               handler: function() {
                   Ext.getCmp('restaurantId').setValue(localStorage.getItem('editRestaurantId'));
                   Ext.getCmp('userId').setValue(localStorage.getItem("uid"));
                   newDishForm.submit({
                       url: '/menu_items',
                       method: 'post',
                       submitDisabled: true,
                       waitMsg: 'Saving Data...Please wait.',
                       success: function (objForm,httpRequest) {
                           var mbox = new Ext.MessageBox({});
                           mbox.alert("Record Saved");
                           //redirect back to restaurant list?
                       },
                       failure: function() {
                           console.log('submissionFailed');
                       }
                   })
               }
           }
        ]}
    ]
});
