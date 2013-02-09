$(function(){
	var OptionModel = Backbone.Model.extend({
		defaults: function(){
			return {
				num: 1,
				size: 2,
				unit: undefined,
				price: '$.99',
				summary: '',
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
				unitsUsed = _.uniq( this.pluck('unit') ),
				lowestUnitPrice = 0;

			console.log(unitsUsed);

			//	remove all indicators of "the deal"
			$(this.models).each(function(i, m){
				var unitPrice;
				m.set('deal', false);

				unitPrice = m.get('price') / ( m.get('num') * m.get('size') * parseFloat(m.get('unit')) );

				lowestUnitPrice = Math.min(unitPrice, lowestUnitPrice);
				
				m.set('summary', unitPrice);
			});

			console.log(lowestUnitPrice);

			

			this.models[this.models.length - 1].set('deal', true);
		}
	});

	var OptionView = Backbone.View.extend({
		initialize: function(){
			var that = this;
			var template = _.template( $('#option-view').html(), this.model.toJSON() );
			this.$el.html(template);
			this.listenTo( this.model, 'change:deal', function(model, value){
				that.pick( value )
			});
			this.listenTo( this.model, 'change:summary', function(model, value){
				that.showSummary(value);
			});
		},
		render: function(){
			return this;
		},
		events: {
			'blur input, select': 'updateModel'
		},
		updateModel: function(ev){
			var field = $(ev.target),
				val = field.val(),
				attribute = field.attr('name');

			if(attribute !== 'unit'){
				val = val.replace(/[^0-9.]/g, '');
			};

			this.model.set(attribute, val);
		},
		pick: function(isDeal){
			if(isDeal){
				this.$el.addClass('alert alert-success');
			} else {
				this.$el.removeClass('alert alert-success');
			};
		},
		showSummary: function(val){
			this.$el.find('.summary').html(val);
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

			view.$el.find('input').first().focus();
		},
		compare: function(){
			options.showDeal()
		}
	});

	var app = new AppView();
});