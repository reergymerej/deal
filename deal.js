$(function(){
	var OptionModel = Backbone.Model.extend({
		defaults: function(){
			return {
				num: 1,
				size: 2,
				unit: 'Liter',
				price: '$.99',
				optionNum: options.models.length + 1
			}
		},
		initialize: function(){
		}
	});

	var Options = Backbone.Collection.extend({
		model: OptionModel,
		url: 'whatever',
		showDeal: function(){
			//	find comparison unit
			var comparisonUnit,
				unitsUsed = _.uniq( this.pluck('unit') );

			console.log(unitsUsed);

			console.log(this.models);

			this.models[this.models.length - 1].set('deal', true);
		}
	});

	var OptionView = Backbone.View.extend({
		initialize: function(){
			var template = _.template( $('#option-view').html(), this.model.toJSON() );
			this.$el.html(template);
			this.listenTo(this.model, 'change:deal', this.pick);
		},
		render: function(){
			return this;
		},
		events: {
			'blur input': 'updateModel'
		},
		updateModel: function(ev){
			var field = $(ev.target),
				val = field.val(),
				attribute = field.attr('name');

			this.model.set(attribute, val);
		},
		pick: function(){
			console.log(arguments);
			this.$el.addClass('alert alert-success');
		}
	});

	var options = new Options();

	var AppView = Backbone.View.extend({
		el: $('.content'),
		events: {
			'click #add': 'newOption',
			'click #compare': 'compare'
		},
		newOption: function(){
			//	create new model
			var option = new OptionModel();

			//	add to collection
			options.add(option);

			//	create view
			var view = new OptionView({model: option});

			//	append view
			$('#deals').append( view.render().el );
		},
		compare: function(){
			options.showDeal()
		}
	});

	var app = new AppView();
});