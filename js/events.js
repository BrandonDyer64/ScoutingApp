$(document).ready(function() {
   function parseDataArray(arr) {
      var result = {};
      arr.forEach(function(obj) {
         result[obj.name] = decodeURIComponent(obj.value);
      });
      return result;
   }

   $("body").on("submit", "form[method=async][action]", function() {
      var route = routes.routes.filter(function(route) {
         return route.initialized
      })[0] || {};

      route.formSubmit = (route.formSubmit || Function()).bind(route);
      route.formError = (route.formError || Function()).bind(route);
      route.formSuccess = (route.formSuccess || Function()).bind(route);

      var $form = $(this).is("form") ? $(this) : $(this).closest("form");
      var data = parseDataArray($form.serializeArray());

      route.formSubmit($form, data);

      messages.reset();
      messages.addMessages([{
         text: "Loading...",
         type: "info"
      }]);
      messages.render();
      $(window).scrollTop(0);
      $form.find(".has-error").removeClass(".has-error");

      function getErrorMessageObj(message) {
         if (typeof message == "string") {
            message = {
               msg: message
            };
         }
         if (message.field) {
            $form.find('[name="'+message.field+'"]').closest('.form-group').addClass('has-error');
         }
         return {
            text: message.msg,
            type: "danger"
         };
      }

      API.post($form.attr("action").trim(), data, function(res) {
         messages.reset();
         if (typeof res.error == "object" && res.error.filter) {
            messages.addMessages(res.error.map(getErrorMessageObj));
         }
         if (typeof res.errors == "object" && res.errors.filter) {
            messages.addMessages(res.errors.map(getErrorMessageObj));
         }
         if (messages.messages.length) {
            route.formError(res);
         } else {
            messages.addMessages([{
               text: "Your information has been updated!",
               type: "success"
            }]);
            route.formSuccess(res);
         }
         messages.render();
      });
      return false;
   });
   $("body").on("submit", "form[method=redirect][action]", function() {
      var $form = $(this).is("form") ? $(this) : $(this).closest("form");
      var data = parseDataArray($form.serializeArray());
      var url = (new Ractive({
         template: $form.attr("action"),
         data: data
      })).toHTML();
      router.setRoute(url);
      return false;
   });

   $overlay = $("<div>", {
      class: "overlay",
      css: {
         "display": "none"
      }
   }).click(function() {
      if ($('.collapse.in').length > 0) {
         $('.navbar-toggle').click();
      }
   });

   $overlay.prependTo("html");

   $('.navbar-toggle').click(function() {
      if ($('.collapse.in').length > 0) {
         $overlay.hide();
      } else {
         $overlay.show();
      }
   });

   $("body").on("keyup", "textarea", function() {
      $(this).height(1);
      $(this).height(this.scrollHeight);
   });
});
