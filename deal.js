$(function(){
	var OptionModel = Backbone.Model.extend({
		defaults: function(){
			return {
				num: 1,
				size: 2,
				unit: undefined,
				price: '$.99',
				summary: '',
				optionNum: options.models.length + 1,
				measurement: $('#measurement').val()
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
				lowestUnitPrice;

			//	remove all indicators of "the deal"
			$(this.models).each(function(i, m){
				var unitPrice;

				m.set('deal', false);

				unitPrice = m.get('price') / ( m.get('num') * m.get('size') * parseFloat(m.get('unit')) );

				if(!lowestUnitPrice){
					lowestUnitPrice = unitPrice;
				} else {
					lowestUnitPrice = Math.min(unitPrice, lowestUnitPrice);
				};
				
				m.set('unitPrice', unitPrice);
			});

			this.each(function(m){
				m.set('deal', m.get('unitPrice') === lowestUnitPrice);
			});
		},
		changeMeasurement: function(measurement){
			$(this.models).each(function(i, m){
				m.set('measurement', measurement);
			});
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
			this.listenTo( this.model, 'change:unitPrice', function(model, value){
				that.showSummary(value);
			});
			this.listenTo( this.model, 'change:measurement', function(){
				that.displayUnits();
			});
		},
		render: function(){
			this.displayUnits();
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
		},
		displayUnits: function(){
			$('option[class!="' + this.model.get('measurement') + '"]', this.$el).attr('disabled', 'disabled');
			$('option[class="' + this.model.get('measurement') + '"]', this.$el).removeAttr('disabled');
			$('select[name="unit"]', this.$el).val('');
		}
	});

	var options = new Options();

	var AppView = Backbone.View.extend({
		initialize: function(){
			this.changeMeasurement();
		},
		el: $('.container'),
		events: {
			'click #add'			: 'newOption',
			'click #compare'		: 'compare',
			'change #measurement'	: 'changeMeasurement' 
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

			$('#compare').fadeIn('fast');
		},
		compare: function(){
			options.showDeal()
		},
		changeMeasurement: function(){
			options.changeMeasurement( $('#measurement').val() );
		}
	});

	var app = new AppView();
});