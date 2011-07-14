/* 
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

//from dishes.js

Ext.regModel('Dish',
{
    fields: ['name','id','price','description','restaurant_id','restaurant','distance','menu_item_avg_rating_count','avg_rating',
      {
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
    fields: ['menu_item'],
    belongsTo: {
      name: 'menu_item',
      model: "Dish"
    }
});



//activity.js

Ext.regModel("MenuItemRating", {
  fields: ["user", "rating","created_at", "updated_at", "review", "id", "user_id", "menu_item_id", "menu_item"],
  belongsTo: [{
    model: 'Dish',
    name: 'menu_item',
    belongsTo: {
      model: 'Restaurant',
      name: 'restaurant'
    }
  },{
    model: 'User',
    name: 'user'
  }]
});


Ext.regModel('Restaurant', {
  fields: ['name', 'id']
});


//used in restaurants.js
//this should be combined with Dish above
Ext.regModel('RestaurantDish',
{
    fields: ['name','id','price','description','restaurant_id','restaurant','distance','menu_item_avg_rating_count','avg_rating','count',{
        name: 'rating',
        convert: function(value, record) {
            if(record.get('menu_item_avg_rating_count').avg_rating) {
                return record.get('menu_item_avg_rating_count').avg_rating.toString();
            } else {
                return "unrated";
            }
        }
    },{
        name: 'rating_count',
        convert: function(value, record) {
            if(record.get('menu_item_avg_rating_count').count) {
                if(record.get('menu_item_avg_rating_count').count.toString()=="1") {
                    return record.get('menu_item_avg_rating_count').count.toString()+" review";
                } else {
                    return record.get('menu_item_avg_rating_count').count.toString()+" reviews";
                }
            } else {
                return "";
            }
        }
    },{
        name: 'restaurant_name',
        convert: function(value, record) {
            return record.get('restaurant').name.toString();
        }
    }]
});

Ext.regModel('Restaurants',
{
    fields: ['distance','name','id']
});

Ext.regModel('DishSearch',
{
    fields: ['name','id','price','description','restaurant_id']
});