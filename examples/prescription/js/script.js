$(function() {

const newDrugUrl = "./snippets/new-drug.html";
const drugsUrl = "./json/drugs.json";

var currPresId = 1;

var drugList = {};
$.get(drugsUrl, function(data) {
    drugList = data;
    for (var drugId in drugList) {
        $("#drug-names").append("<option>" + drugId + "</option>");
    }
});

var presList = [];


// FUNCTIONS
function checkMissing(data) {
    for (var field in data) {
        if (data[field] === "") {
            return true;
        }
    }

    return false;
}

function replacePlaceholder(templateStr, presData) {
    for (var placeholderStr in presData) {
        var replaceStr = "{{" + placeholderStr + "}}";
        templateStr = templateStr.replace(
            new RegExp(replaceStr, "g"),
            presData[placeholderStr]
        );
    }
    return templateStr;
}

function clearRowNew() {
    $("#prescription-row-0").find("input").val("");
    $("#pres-row-unit-div-0").text("");
    $("#pres-row-name-input-0").focus();
}

function toggleEdit(presId, edit) {
    if (edit) {
        $("#prescription-row-" + presId + " .view-mode").attr("style", "display: none;");
        $("#prescription-row-" + presId + " .edit-mode").attr("style", "");
        $("#pres-row-name-input-" + presId).focus();
    } else {
        $("#prescription-row-" + presId + " .view-mode").attr("style", "");
        $("#prescription-row-" + presId + " .edit-mode").attr("style", "display: none;");
    }
}

function addDrug(presId) {
    var presData = {
        presid: presId,
        rowid: $("#prescription-table tr").length - 1,
        name: $("#pres-row-name-input-0").val(),
        dailydose: $("#pres-row-dailydose-input-0").val(),
        unit: $("#pres-row-unit-div-0").text(),
        nodays: $("#pres-row-nodays-input-0").val(),
        instruction: $("#pres-row-instruction-input-0").val()
    };

    if (checkMissing(presData)) {
        alert("Chưa nhập đủ thông tin kê đơn.");
        return false;
    }
    if (!(presData.name in drugList)) {
        alert("Thuốc không có trong danh sách.");
        return false;
    }
    if (presList.find(el => presData.name === el.name) != undefined) {
        alert("Thuốc đã được kê rồi.");
        return false;
    }
    
    $.get(newDrugUrl, function(newDrugTemplateHtml) {
        newDrugTemplateHtml = replacePlaceholder(newDrugTemplateHtml, presData);
        var newDrugElem = $(newDrugTemplateHtml);
        newDrugElem.find("button").on("click", btnClicked);
        newDrugElem.find("#pres-row-name-input-" + presId).on("input", inpNameChanged);
        newDrugElem.find("#pres-row-name-input-" + presId).on("blur", inpNameLostFocus);
        $("#prescription-table-body").append(newDrugElem);
        presList.push(presData);
    });

    return true;
}

function removeDrug(presId) {
    var drugName = $("#pres-row-name-div-" + presId).text();

    presList.splice(el => drugName == el.name);
    $("#prescription-row-" + presId).remove();

    // Refresh numbering
    $(".pres-col-id").each(function(i) {
        $(this).text((i+1) + ".");
    });
}

function copyDrugToDiv(presId) {
    var presData = presList.find(el => presId == el.presid);

    presData.name = $("#pres-row-name-input-" + presId).val();
    presData.dailydose = $("#pres-row-dailydose-input-" + presId).val();
    presData.unit = $("#pres-row-unit-div-" + presId).text();
    presData.nodays = $("#pres-row-nodays-input-" + presId).val();
    presData.instruction = $("#pres-row-instruction-input-" + presId).val();
    
    $("#pres-row-name-div-" + presId).text(presData.name);
    $("#pres-row-dailydose-div-" + presId).text(presData.dailydose);
    $("#pres-row-nodays-div-" + presId).text(presData.nodays);
    $("#pres-row-instruction-div-" + presId).text(presData.instruction);
}

function copyDrugToInput(presId) {
    var presData = presList.find(el => presId == el.presid);

    $("#pres-row-name-input-" + presId).val(presData.name);
    $("#pres-row-dailydose-input-" + presId).val(presData.dailydose);
    $("#pres-now-unit-div-" + presId).text(presData.presid);
    $("#pres-row-nodays-input-" + presId).val(presData.nodays);
    $("#pres-row-instruction-input-" + presId).val(presData.instruction);
}

function removeAll() {
    $("#div-message").text("");
    $(".prescription-row").remove();
    currPresId = 1;
}


// EVENTS
function inpNameChanged(event) {
    var drugName = $(this).val();

    if (drugName != "") {
        var presId = $(this).attr("presid");
        if (drugName in drugList) {
            $("#pres-row-unit-div-" + presId).text(drugList[drugName].unit);
            $("#pres-row-instruction-input-" + presId).val(drugList[drugName].defaultInstruction);
        }
    }
}

function inpNameLostFocus(event) {
    var drugName = $(this).val();
    var presId = $(this).attr("presid");
    var presData = presList.find(el => el.presid == presId);
    var originalDrugName = presData === undefined ? "" : presData.name;

    if ((drugName != "") & (drugName != originalDrugName)) {
        if (!(drugName in drugList)) {
            alert("Thuốc không có trong danh sách.");
            $(this).val(originalDrugName);
            $(this).focus();
            return;
        }
        if (presList.find(el => el.name === drugName) != undefined) {
            alert("Thuốc đã được kê rồi.");
            $(this).val(originalDrugName);
            $(this).focus();
        }
    }
}

function btnClicked(event) {
    var btnId = $(this).attr("id");

    switch (btnId) {
        case "btn-new-add":
            if (addDrug(currPresId)) {
                clearRowNew();
                currPresId++;
            }
            break;
        
        case "btn-new-clear":
            clearRowNew();
            break;
    
        case "btn-row-remove":
            var presId = $(this).attr("presid");
            removeDrug(presId);
            break;

        case "btn-row-edit":
            var presId = $(this).attr("presid");
            toggleEdit(presId, true);
            break;

        case "btn-row-accept":
            var presId = $(this).attr("presid");
            copyDrugToDiv(presId);
            toggleEdit(presId, false);
            break;

        case "btn-row-cancel":
            var presId = $(this).attr("presid");
            copyDrugToInput(presId);
            toggleEdit(presId, false);
            break;

        case "btn-clear":
            removeAll();
            break;

        case "btn-cancel":
            removeAll();
            break;

        case "btn-submit":
            var presStr = "<h2>Đơn thuốc</h2><ol>";
            for (var drugData of presList) {
                var unitStr = drugData.unit === undefined ? "" : drugData.unit;
                presStr += "<li>" + drugData.name.toUpperCase() + " " +
                    drugData.dailydose +  " " +
                    unitStr + "/ngày x " +
                    drugData.nodays + " ngày<br>" +
                    drugData.instruction + "</li>"
            }
            presStr += "</ol>";
            $("#div-message").html(presStr);
            break;

        default:
            break;
    }
}
    
$("button").on("click", btnClicked);
$("#pres-row-name-input-0").on("input", inpNameChanged);
$("#pres-row-name-input-0").on("blur", inpNameLostFocus);
$("#pres-row-name-input-0").focus();

});
