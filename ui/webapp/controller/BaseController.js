sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox"
], function(
	Controller,
	MessageBox
) {
	"use strict";

	return Controller.extend("com.ui.document.ui.controller.BaseController", {
        getRouter: function () {
			return this.getOwnerComponent().getRouter();
		},
        getModel: function (sName) {
			return this.getView().getModel(sName);
		},
        setModel: function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},
        getResourceBundle: function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},
        onNavBack: function () {
			let sPreviousHash = History.getInstance().getPreviousHash();

			if (sPreviousHash !== undefined) {
				history.go(-1);
			} else {
				this.getRouter().navTo("master", {}, true);
			}
		},
        fnQuery: {
			get: function (url, path, params, header) {
				url = url.concat(path);
				header = this._mergeHeader(header);
				return new Promise((resolve, reject) => {
					$.ajax({
						url: url,
						type: "GET",
						headers: header,
						success: res => {
							resolve(res);
						},
						error: res => {
							reject(res.responseJSON);
						}
					});
				});
			},
			post: function (url, path, params, body, header) {
				url = url.concat(path);
				header = this._mergeHeader(header);
				return new Promise((resolve, reject) => {
					$.ajax({
						url: url,
						type: "POST",
						headers: header,
						data: JSON.stringify(body),
						success: res => {
							resolve(res);
						},
						error: res => {
							reject(res.responseJSON);
						}
					});
				});
			},

			_mergeHeader: function (h) {
				let header = h || {};
				if (!header.hasOwnProperty("Content-Type")) {
					header["Content-Type"] = "application/json";
				}
				return header;
			}
		},
		onReset: function(oEvent) {
			this.resetModelData();
		},
		getApiInputInitialModel: function() {
			return {
				"input": {
					"sourceLanguage": "",
					"targetLanguage": "",
					"data": "",
					"contentType": "text/html"
				},
				"output": {
					"sourceLanguage": "",
					"targetLanguage": "",
					"data": "",
					"contentType": ""
				},
				"job": {
					"id": "",
					"progress": "",
					"status": ""
				},
				"scheduleinput": "",
				"scheduleresult": ""
			}
		},
		resetModelData() {
			this.getModel("data").setData(this.getApiInputInitialModel());
		},
		onSourceLanguageChange: function(oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			var oContext = oSelectedItem.getBindingContext("supportedLanguages");
			var iCharacterLimit = oContext.getObject("CharacterLimit");
			this.getModel("view").setProperty("/maxLength", parseInt(iCharacterLimit));
		},
		_isValidTranslationInput() {
			var oPayload= this.getModel("data").getProperty("/input");
			var isText = this.getModel("view").getProperty("/isText");
			var sSrcLanguage = oPayload.sourceLanguage;
			var sTargetLanguage = oPayload.targetLanguage;
			var sTranslateText = oPayload.data;
			var sFile = this.byId("idUploadFile").getValue();

			if (isText) {
				if (!sSrcLanguage || !sTargetLanguage || !sTranslateText) {
					MessageBox.error("Missing Mandatory Input for Translation.");
					return false;
				}
			}else {
				if (!sTargetLanguage || !sFile) {
					MessageBox.error("Missing Mandatory Input for Translation.");
					return false;
				}
			}
			return true;
		},
		_displayCatchedError(oError) {
			if (oError && !jQuery.isEmptyObject(oError)) {
				var oErrorResponse = oError.error;
				MessageBox.error(oErrorResponse.message);
			}
		},
		_setResultToForm(data) {
			var oDataModel = this.getModel("data");
			if (data && !jQuery.isEmptyObject(data)) {
				if (this.getModel("view").getProperty("/isAsync")) {
					oDataModel.setProperty("/job", data);
				}else {
					oDataModel.setProperty("/output", data);
				}
			}
		}
	});
});