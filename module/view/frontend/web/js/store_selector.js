define([
    'jquery',
    'mage/template',
    'text!./templates/result.html',
    'ko',
    'Magento_Ui/js/modal/modal',
    'jquery/ui',
    'mage/translate'
], function ($, mageTemplate, resultTemplate, ko, modal){
    "use strict";

    $.widget('magentoeseInStorePickup.storeSelector', {
        options: {
            resultContainer: "[data-role='result']",
            searchField: "[data-role='store-search-field']",
            searchUrl: '',
            selectionUrl: '',
            hasStoreBeenChosen: false,

            template: resultTemplate,
            modalWindow: null,
            storeSelectorSelector: "#instorepickup-storeselector",
            storeNavSelector: ".instorepickup-trigger",
            storeSearchInputSelector: "#store-search",
            storeSearchTriggerSelector: ".instorepickup-search-trigger",
            storeChangeTriggerSelector: ".instorepickup-change-trigger",
            storeDropdownSelector: ".instorepickup-dropdown"
        },

        /**
         * Creates widget 'magentoeseInStorePickup.storeSelector'
         * @private
         */
        _create: function () {
            var self = this;

            // Create the popup for searching stores
            this._createPopUp($(this.options.storeSelectorSelector));
            $(this.options.storeSelectorSelector).show();

            // Bind elements to display search popup modal
            $(this.options.storeSearchTriggerSelector).on({'click': $.proxy(this._onNavClick, this)});
            this._bindForStoreChange();

            // Bind events for getting results of a zipcode search inside the popup modal
            this._on({'click [data-role="store-selector"]': $.proxy(this._onSearch, this)});
            $(this.options.storeSearchInputSelector).keyup(function (e) {
                if (e.keyCode == 13) {
                    self._onSearch();
                }
            });
        },

        /** Create popUp window for provided element */
        _createPopUp: function(element) {
            this.options.modalWindow = element;
            var options = {
                'type': 'popup',
                'title': $.mage.__('Find your local store'),
                'modalClass': 'instorepickup-storeselector-popup',
                'responsive': true,
                'innerScroll': true,
                'buttons': []
            };
            modal(options, $(this.options.modalWindow));
        },

        /**
         * Bind for click event on store change elements
         */
        _bindForStoreChange: function() {
            $(this.options.storeChangeTriggerSelector).on({'click': $.proxy(this._onStoreChangeClick, this)});
        },

        /**
         * Respond to Navigation click event
         */
        _onNavClick: function() {
            if (this.options.hasStoreBeenChosen == false) {

                // close the dropdown menu if it was open
                // reference: http://stackoverflow.com/questions/8506621/accessing-widget-instance-from-outside-widget
                $(this.options.storeDropdownSelector).data("mageDropdownDialog").close();

                // open the popup modal window
                this.openPopup();
            }
        },

        /**
         * Respond to Change Store click event
         */
        _onStoreChangeClick: function() {

            // close the dropdown menu if it was open
            // reference: http://stackoverflow.com/questions/8506621/accessing-widget-instance-from-outside-widget
            $(this.options.storeDropdownSelector).data("mageDropdownDialog").close();

            // open the popup modal window
            this.openPopup();
        },

        /**
         * Open the popup
         */
        openPopup: function() {
            if (this.options.modalWindow) {
                $(this.options.modalWindow).modal('openModal');
                $(this.options.storeSearchInputSelector).focus();
            } else {
                alert($.mage.__('Store Selector is disabled.'));
            }
        },

        /**
         * Close the popup
         */
        closePopup: function() {
            if (this.options.modalWindow) {
                $(this.options.modalWindow).modal('closeModal');
            } else {
                alert($.mage.__('Store Selector is disabled.'));
            }
        },

        /**
         * Get search results
         */
        _onSearch: function() {
            var self = this;

            $('body').find(self.options.messagesSelector).empty();
            self.element.find(self.options.resultContainer).empty();
            var params = {
                "searchCriteria": $(self.options.searchField).val()
            };

            $.ajax({
                url: self.options.searchUrl,
                dataType: 'json',
                data: params,
                context: $('body'),
                showLoader: true
            }).done(function (response) {
                self._displaySearchResults(response);
            }).fail(function (response) {
                var msg = $("<div/>").addClass("message notice").text(response.responseText);
                this.find(self.options.resultContainer).prepend(msg);
            });
        },

        /**
         * Display results
         * @param response
         * @private
         */
        _displaySearchResults: function(response){
            var template = mageTemplate(this.options.template);
            template = template({data: response});
            this.element.find(this.options.resultContainer).append($(template));

            $('button[data-role="store-selector-choice"]').on('click', $.proxy(this._onStoreChoice, this));
        },

        /**
         * Submit store selection
         */
        _onStoreChoice: function(context) {
            var self = this;

            var params = {
                "store-id": context.currentTarget.parentElement.elements["store-id"].value
            };

            // AJAX call to set cookie with store location id and get store details from Magento
            $.ajax({
                url: self.options.selectionUrl,
                dataType: 'json',
                data: params,
                context: $('body'),
                showLoader: true
            }).done(function (response) {
                self._finishStoreChoice(response);
            }).fail(function (response) {
                var msg = $("<div/>").addClass("message notice").text(response.responseText);
                this.find(self.options.resultContainer).prepend(msg);
            });
        },

        /**
         * Finish processing store choice
         * @param response
         * @private
         */
        _finishStoreChoice: function(response){
            // Set chosen option to prevent search popup on nav click
            this.options.hasStoreBeenChosen = true;

            // Update page navigation with the chosen store
            $(this.options.storeNavSelector+' strong span').text($.mage.__('My Store: ') + response.storeName);

            // Update page store location dropdown with store details
            $(this.options.storeDropdownSelector).empty();
            $(this.options.storeDropdownSelector).append(response.storeDetailHtml);

            // Rebind any store change elements after injecting new HTML
            this._bindForStoreChange();

            this.closePopup();
        }
    });

    return {
        'magentoeseInStorePickupStoreSelector': $.magentoeseInStorePickup.storeSelector
    };
});