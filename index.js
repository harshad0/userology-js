(function () {
  let questionsArray = [];

  let currIndex = 0;
  let condition = new Boolean(false);
  let conditionValue = 0;
  let currentAnswer = null;
  let selectedDate = null;
  let selectedButton = null;
  let selectedTimeSlot = null;
  let selectedTimeSlotButton = null;
  let timeSlots = null;
  let contactInput = { email: null, contact: null };

  const configJson = localStorage.getItem("config");
  const userAttributesJson = localStorage.getItem("userAttributes");
  const contactInfoJson = localStorage.getItem("contactInfo");
  const studyId = localStorage.getItem("studyId");
  const config = JSON.parse(configJson);
  const userAttributes = JSON.parse(userAttributesJson);
  const contactInfo = JSON.parse(contactInfoJson);
  const email = contactInfo?.email;
  const contact = contactInfo?.contact;
  const userId = userAttributes?.userId;
  const userName = userAttributes?.userName;
  const baseUrl1 = config?.baseUrl1;

  const fetchTimeSlots = async (date) => {
    try {
      const response = await fetch(baseUrl1 + "/schedule/getTimeSlots", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: date,
          studyId: studyId,
        }),
      });

      const data = await response.json();
      timeSlots = data?.availableSlots?.availableSlots;
      showLoader(false);
    } catch (error) {
      console.error(error);
    }
  };

  function closeInterceptDialog() {
    const dialogBox = document.getElementById("dialog-box");
    if (dialogBox) {
      dialogBox.remove();
    }
  }

  function handleNpsClick(question, value, index) {
    const nextButton = document.querySelector(".question-button-label");
    nextButton.disabled = false;
    nextButton.style.backgroundColor = "black";

    currentAnswer = value;
    const conditions = question?.condition;
    for (let i = 0; i < conditions?.length; i++) {
      if (conditions[i]?.operator === "is greater than") {
        if (value >= conditions[i]?.value) {
          condition = true;
          conditionValue = conditions[i]?.nextQuestionId;
          break;
        }
      } else {
        if (value <= conditions[i]?.value) {
          condition = true;
          conditionValue = conditions[i]?.nextQuestionId;
          break;
        }
      }
    }
    updateNpsButtons(index);
  }

  function updateNpsButtons(selectedIndex) {
    const npsButtons = document.querySelectorAll(".nps-button");

    npsButtons.forEach((button, index) => {
      if (index === selectedIndex) {
        button.style.backgroundColor = "black";
        button.style.color = "#E8FD84";
      } else {
        button.style.backgroundColor = "#E8FD84";
        button.style.color = "black";
      }
    });
  }

  function displayNPS(question, questionDialog) {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const npsDiv = document.createElement("div");
    npsDiv.style.width = "100vw";

    arr.forEach((item, index) => {
      const npsButton = document.createElement("button");
      npsButton.innerHTML = item;
      npsButton.className = "nps-button";
      npsButton.style.backgroundColor = "#E8FD84";
      npsButton.style.color = "black";
      npsButton.style.padding = "10px 11px";
      npsButton.style.border = "0.5px solid gray";
      npsButton.style.cursor = "pointer";
      npsDiv.appendChild(npsButton);
      npsButton.addEventListener("click", () =>
        handleNpsClick(question, item, index)
      );
    });

    questionDialog.appendChild(npsDiv);

    const npsLabelDiv = document.createElement("div");
    npsLabelDiv.className = "npsLabel";
    npsLabelDiv.style.display = "flex";
    npsLabelDiv.style.alignItems = "center";
    npsLabelDiv.style.gap = "5rem";
    npsLabelDiv.style.marginTop = "-10px";

    const labelOne = document.createElement("h4");
    labelOne.style.fontSize = "15px";
    labelOne.innerHTML = "Not likely";
    labelOne.style.color = "rgba(128, 128, 128, 0.92)";

    const labelTwo = document.createElement("h4");
    labelTwo.style.fontSize = "15px";
    labelTwo.innerHTML = "Likely";
    labelTwo.style.color = "rgba(128, 128, 128, 0.92)";

    npsLabelDiv.appendChild(labelOne);
    npsLabelDiv.appendChild(labelTwo);

    questionDialog.appendChild(npsLabelDiv);
  }

  function handleOpenText(eve) {
    const nextButton = document.querySelector(".question-button-label");
    const value = eve.target.value;
    if (value === "") {
      nextButton.disabled = true;
      nextButton.style.backgroundColor = "gray";
    } else {
      nextButton.disabled = false;
      nextButton.style.backgroundColor = "black";
    }
    currentAnswer = value;
  }

  function displayOpenText(question, questionDialog) {
    var textarea = document.createElement("textarea");
    textarea.type = "input";
    textarea.placeholder = "Write the answer";
    textarea.style.border = "1px solid gray";
    textarea.style.padding = "10px";
    textarea.style.borderRadius = "5px";
    textarea.style.marginTop = "1rem";
    textarea.style.width = "14rem";
    textarea.addEventListener("input", (eve) => handleOpenText(eve));

    questionDialog.appendChild(textarea);
  }

  function handleRadioChange(question, index, val) {
    const nextButton = document.querySelector(".question-button-label");
    nextButton.disabled = false;
    nextButton.style.backgroundColor = "black";

    currentAnswer = val;

    const conditions = question?.condition;
    for (let condt of conditions) {
      const condtValues = condt?.value;
      const includesValue = condtValues?.includes(val.toString());
      if (condt?.operator === "equals any of") {
        if (includesValue) {
          conditionValue = condt?.nextQuestionId;
          condition = true;
          break;
        } else {
          condition = false;
        }
      } else if (condt?.operator === "doesn't equals any of") {
        if (!includesValue) {
          conditionValue = condt?.nextQuestionId;
          condition = true;
          break;
        }
      }
    }
  }

  function createRadioInput(question, item, index) {
    const radioContainer = document.createElement("div");
    radioContainer.className = "icons";

    const radioInput = document.createElement("input");
    radioInput.type = "radio";
    radioInput.style.cursor = "pointer";
    radioInput.name = "multiple-choice-single-text";
    radioInput.addEventListener("change", () => {
      handleRadioChange(question, index, item);
    });

    const radioLabel = document.createElement("p");
    radioLabel.style.color = "#242428";
    radioLabel.style.fontSize = "13px";
    radioLabel.textContent = item;

    radioContainer.appendChild(radioInput);
    radioContainer.appendChild(radioLabel);

    return radioContainer;
  }

  function displayMultipleChoiceSingleTextOptions(question, questionDialog) {
    const radioDiv = document.createElement("div");
    radioDiv.className = "radio-icons";

    question?.options?.forEach((item, index) => {
      const radioContainer = createRadioInput(question, item, index);
      radioDiv.appendChild(radioContainer);
    });
    questionDialog.appendChild(radioDiv);
  }

  function updateButtonStyles(button, date, type) {
    let selectedType = type === "date" ? selectedDate : selectedTimeSlot;
    button.style.color = selectedType === date ? "#E8FD84" : "black";
    button.style.backgroundColor = selectedType === date ? "black" : "white";
  }

  function showLoader(value) {
    const nextButton = document.querySelector(".question-button-label");
    if (value) {
      nextButton.disabled = true;
      nextButton.style.backgroundColor = "gray";
      const loader = document.createElement("div");
      loader.className = "loader";
      nextButton.appendChild(loader);
    } else {
      nextButton.disabled = false;
      nextButton.style.backgroundColor = "black";
      const loader = nextButton.querySelector(".loader");
      if (loader) {
        nextButton.removeChild(loader);
      }
    }
  }

  async function handleDateClick(date, button) {
    const nextButton = document.querySelector(".question-button-label");
    nextButton.disabled = false;
    nextButton.style.backgroundColor = "black";

    currentAnswer = date;

    if (selectedButton) {
      updateButtonStyles(selectedButton, date, "date");
    }
    if (selectedDate !== date) {
      showLoader(true);
      selectedDate = date;
      selectedButton = button;
      updateButtonStyles(button, date, "date");
      await fetchTimeSlots(date);
    }
  }

  function handleCheckboxChange(question) {
    const checkboxes = document.querySelectorAll(".checkbox");
    let count = 0;

    checkboxes?.forEach((checkbox) => {
      if (checkbox.checked) {
        count = 1;
      }
    });

    const nextButton = document.querySelector(".question-button-label");
    if (count === 1) {
      nextButton.disabled = false;
      nextButton.style.backgroundColor = "black";
    } else {
      nextButton.disabled = true;
      nextButton.style.backgroundColor = "gray";
    }

    let options = [];
    checkboxes?.forEach((checkbox, index) => {
      if (checkbox.checked) {
        const val = document.querySelectorAll(".checkbox-value");
        options.push(val[index].textContent);
      }
    });

    currentAnswer = options;

    const conditions = question?.condition;
    if (conditions.length === 0) return;

    for (const condt of conditions) {
      const condtValues = condt.value;

      switch (condt.operator) {
        case "is exactly":
          const arraysAreEqual =
            options.length === condtValues.length &&
            options.every((option, index) => option === condtValues[index]);
          if (arraysAreEqual) {
            conditionValue = condt.nextQuestionId;
            condition = true;
            break;
          }
          break;

        case "includes at least one of":
          const includesValue = options.some((option) =>
            condtValues.includes(option)
          );

          if (includesValue) {
            conditionValue = condt.nextQuestionId;
            condition = true;
            break;
          }
          break;

        case "includes all of":
          if (options.length === condtValues.length) {
            conditionValue = condt.nextQuestionId;
            condition = true;
            break;
          }
          break;

        case "doesn't include any of":
          if (options.length === 0) {
            conditionValue = condt.nextQuestionId;
            condition = true;
            break;
          }
          break;

        default:
          break;
      }
    }
  }

  function displayMultiSelectMcqOptions(question, questionDialog) {
    var radioIconsDiv = document.createElement("div");
    radioIconsDiv.className = "radio-icons";

    var options = question.options;
    for (var index = 0; index < options.length; index++) {
      var item = options[index];

      var iconsDiv = document.createElement("div");
      iconsDiv.className = "icons";
      iconsDiv.key = question.id + item + index;

      var checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "checkbox";
      checkbox.style.cursor = "pointer";
      checkbox.addEventListener("change", () => handleCheckboxChange(question));

      var paragraph = document.createElement("p");
      paragraph.style.color = "#242428";
      paragraph.style.fontSize = "13px";
      paragraph.className = "checkbox-value";
      paragraph.textContent = item;

      iconsDiv.appendChild(checkbox);
      iconsDiv.appendChild(paragraph);

      radioIconsDiv.appendChild(iconsDiv);
    }

    questionDialog.appendChild(radioIconsDiv);
  }

  function displayDates(question, questionDialog) {
    var dateBtnContainer = document.createElement("div");
    dateBtnContainer.className = "date-btn";

    var title = document.createElement("h4");
    title.textContent = "Select date";
    dateBtnContainer.appendChild(title);

    if (question && question.dates) {
      var dates = question.dates?.slice(0, 3);
      dates.forEach(function (item, index) {
        var button = document.createElement("button");
        button.textContent = item;

        updateButtonStyles(button, item, "date");

        button.addEventListener("click", () => handleDateClick(item, button));

        dateBtnContainer.appendChild(button);
      });
    }

    questionDialog.appendChild(dateBtnContainer);
  }

  function handleTimeSlotClick(time, button) {
    const nextButton = document.querySelector(".question-button-label");
    nextButton.disabled = false;
    nextButton.style.backgroundColor = "black";

    currentAnswer = time?.startTime + " " + time?.endTime;

    if (selectedTimeSlotButton) {
      updateButtonStyles(selectedTimeSlotButton, time, "time");
    }
    if (selectedTimeSlot !== time) {
      selectedTimeSlot = time;
      selectedTimeSlotButton = button;
      updateButtonStyles(button, time);
    }
  }

  function displayTimeSlots(question, questionDialog) {
    const backButton = document.createElement("label");
    backButton.innerHTML = `
          <div style="border: none; padding: 5px; border-radius: 5px; margin-left: -7px; cursor: pointer; display: flex; align-items: center; color: black;">
          <img width="20px" src="https://cdn-icons-png.flaticon.com/128/3114/3114883.png" />
          </div>
                  `;
    backButton.style.border = "none";
    backButton.style.padding = "5px";
    backButton.style.borderRadius = "5px";
    backButton.style.marginLeft = "-7px";
    backButton.style.cursor = "pointer";
    backButton.style.display = "flex";
    backButton.style.alignItems = "center";
    backButton.style.color = "black";
    backButton.addEventListener("click", () => {
      currIndex--;
      selectedDate = null;
      displayQuestion(questionsArray[currIndex], questionDialog);
    });

    const timeBtnDiv = document.createElement("div");
    timeBtnDiv.className = "time-btn";
    const h4 = document.createElement("h4");
    h4.textContent = "Select time slot";
    timeBtnDiv.appendChild(h4);

    const gridContainer = document.createElement("div");
    gridContainer.className = "grid-container";

    timeSlots?.slice(0, 9).forEach((timeSlot, index) => {
      const button = document.createElement("button");
      button.textContent = timeSlot.startTime;
      button.style.color = selectedTimeSlot === timeSlot ? "#E8FD84" : "black";
      button.style.backgroundColor =
        selectedTimeSlot === timeSlot ? "black" : "white";
      button.addEventListener("click", () =>
        handleTimeSlotClick(timeSlot, button)
      );
      gridContainer.appendChild(button);
    });

    timeBtnDiv.appendChild(gridContainer);

    questionDialog.appendChild(backButton);
    questionDialog.appendChild(timeBtnDiv);
  }

  function handleContactInput(e) {
    const { name, value } = e.target;
    contactInput[name] = value;
    let emailError = "";
    let contactError = "";

    if (name === "email") {
      if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
        emailError = "Invalid email format";
      }
    } else if (name === "contact") {
      if (
        !/^(?:\+?[0-9]*)$/.test(value) ||
        value.replace(/[^0-9]/g, "").length < 10
      ) {
        contactError = "Invalid contact number format";
      }
    }

    if (
      emailError === "" &&
      contactError === "" &&
      contactInput.email !== "" &&
      contactInput.contact !== ""
    ) {
      localStorage.setItem(
        "contactInfo",
        JSON.stringify({ ...contactInput, [name]: value })
      );
      if (
        contactInput.email !== "" &&
        contactInput.contact !== "" &&
        contactInput.email !== null &&
        contactInput.contact !== null
      ) {
        const nextButton = document.querySelector(".question-button-label");
        nextButton.style.backgroundColor = "black";
        nextButton.disabled = false;
      }
    } else {
      const nextButton = document.querySelector(".question-button-label");
      nextButton.style.backgroundColor = "gray";
      nextButton.disabled = true;
    }

    const emailErrorDiv = document.querySelector(".email-error");
    const contactErrorDiv = document.querySelector(".contact-error");

    if (name === "email") {
      emailErrorDiv.textContent = emailError;
    } else if (name === "contact") {
      contactErrorDiv.textContent = contactError;
    }
  }

  function displayContactInfo(question, questionDialog) {
    const emailInput = document.createElement("input");
    emailInput.type = "input";
    emailInput.placeholder = "Enter your email";
    emailInput.name = "email";
    emailInput.style.border = "1px solid gray";
    emailInput.style.padding = "10px";
    emailInput.style.borderRadius = "5px";
    emailInput.style.marginTop = "1rem";
    emailInput.style.width = "14rem";
    emailInput.addEventListener("input", handleContactInput);

    const contactInputElem = document.createElement("input");
    contactInputElem.type = "input";
    contactInputElem.placeholder = "Enter your contact number";
    contactInputElem.name = "contact";
    contactInputElem.style.border = "1px solid gray";
    contactInputElem.style.padding = "10px";
    contactInputElem.style.borderRadius = "5px";
    contactInputElem.style.marginTop = "1rem";
    contactInputElem.style.width = "14rem";
    contactInputElem.addEventListener("input", handleContactInput);

    const emailErrorDiv = document.createElement("div");
    emailErrorDiv.style.color = "red";
    emailErrorDiv.className = "email-error";

    const contactErrorDiv = document.createElement("div");
    contactErrorDiv.style.color = "red";
    contactErrorDiv.className = "contact-error";

    questionDialog.appendChild(emailInput);
    questionDialog.appendChild(contactInputElem);
    questionDialog.appendChild(emailErrorDiv);
    questionDialog.appendChild(contactErrorDiv);
  }

  function sendResponse(id, answer, is_responded, isDissmissed) {
    try {
      fetch(baseUrl1 + "/sdk/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studyId: studyId,
          answer: answer?.toString() || "null",
          questionId: id,
          isDissmissed: isDissmissed,
          is_responded: is_responded,
          userId: userId,
        }),
      });
    } catch (e) {
      console.log(e);
    }
  }

  function displayQuestion(question, questionDialog) {
    if (!questionDialog) {
      console.error("Question dialog element not found.");
      return;
    }

    const questionIndexDisplay = `
                  <p style="padding: 0; margin: 0; color: gray; margin-left: 7px; margin-top: 10px;">
                    ${currIndex + 1}/${questionsArray.length}
                  </p>
                `;

    questionDialog.innerHTML = `
                  ${question.text ? `<h4>${question.text}</h4>` : ""}
                  ${
                    question.description
                      ? `<h4>${question.description}</h4>`
                      : ""
                  }
                `;

    switch (question.type) {
      case "OPEN_TEXT":
        displayOpenText(question, questionDialog);
        break;
      case "NPS":
        displayNPS(question, questionDialog);
        break;
      case "MULTIPLE_CHOICE_SINGLE_TEXT":
        displayMultipleChoiceSingleTextOptions(question, questionDialog);
        break;
      case "MULTI_SELECT_MCQ":
        displayMultiSelectMcqOptions(question, questionDialog);
        break;
      case "DATES":
        displayDates(question, questionDialog);
        break;
      case "TIME":
        displayTimeSlots(question, questionDialog);
        break;
      case "THANKYOU":
        displayOpenText(question, questionDialog);
        break;
      case "CONTACT_INFO":
        displayContactInfo(question, questionDialog);
        break;
      default:
        break;
    }

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = `
                  ${questionIndexDisplay}
                  <div class="question-button">
                    <button class="question-button-label" id="close-dialog-btn">${question.buttonLabel}</button>
                  </div>
                `;

    questionDialog.appendChild(tempDiv);

    const nextButton = questionDialog.querySelector(".question-button-label");
    if (question.type !== "SHORT_ANSWER") {
      nextButton.disabled = true;
      nextButton.style.backgroundColor = "gray";
    }
    nextButton.addEventListener("click", async () => {
      if (condition === true) {
        condition = false;
        currIndex = conditionValue - 1;
      } else {
        currIndex++;
      }

      sendResponse(question?.id, currentAnswer, true, false);

      if (currIndex < questionsArray.length) {
        displayQuestion(questionsArray[currIndex], questionDialog);
      } else {
        if (questionsArray[currIndex - 1].type === "TIME") {
          const response = await fetch(baseUrl1 + "/schedule/createEvent", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              studyId: studyId,
              startTime: selectedDate + " " + selectedTimeSlot.startTime,
              participantId: userId,
              userEmail: email || (contactInput && contactInput.email) || "",
              userContact:
                contact || (contactInput && contactInput.contact) || "",
              userName: userName,
            }),
          });

          const confirmationDiv = document.createElement("div");
          confirmationDiv.innerHTML = `
                        <div>
                          <h4>Thank you for booking a slot!</h4>
                          <p style="color: #00000091; line-height: 18px; letter-spacing: 0.2px; font-size: 14px;">
                            We have sent a calendar invite to ${
                              email || (contactInput && contactInput.email)
                            } for ${selectedDate} at ${
            selectedTimeSlot?.startTime
          }.
                          </p>
                          <p style="color: #00000091; line-height: 18px; letter-spacing: 0.2px; font-size: 14px;">
                            We will send a reminder before the call.
                          </p>
                          <img src="https://i.postimg.cc/mk97CsRG/rafiki.png" alt="Confirmation Image" />
                        </div>`;

          questionDialog.innerHTML = "";
          questionDialog.appendChild(confirmationDiv);
          setTimeout(() => {
            closeInterceptDialog();
          }, 9000);
        } else {
          closeInterceptDialog();
        }
      }
    });
  }

  function addCustomStyles() {
    const style = document.createElement("style");
    style.textContent = `#dialog-overlay {
                  position: fixed;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  background-color: rgba(0, 0, 0, 0.5);
                }
      
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
      
                .loader {
                  border: 4px solid rgba(0, 0, 0, 0.1);
                  border-top: 4px solid #ffffff;
                  border-radius: 50%;
                  width: 20px;
                  height: 20px;
                  animation: spin 1s linear infinite;
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%);
                }
                
                #dialog-box {
                  width: 325px;
                  background-color: white;
                  padding: 20px;
                  padding-top: 0;
                  position: absolute;
                  bottom: 4rem;
                  box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
                  right: 4rem;
                  box-sizing: content-box;
                }
                
                #dialog-content,
                #question-dialog {
                  width: 254px;
                  padding: 8px;
                  position: relative;
                  box-sizing: border-box;
                }
                
                #dialog-content h4,
                #question-dialog h4 {
                  font-weight: 500;
                  line-height: 21px;
                  color: #242428;
                }
                
                #dialog-box p {
                  font-size: 12px;
                  color: #666666;
                  font-weight: 500;
                  line-height: 16px;
                }
                
                #close-dialog-btn {
                  background-color: #242428;
                  border: none;
                  padding: 7px;
                  border-radius: 3px;
                  color: #e8fd84;
                  padding-left: 20px;
                  padding-right: 20px;
                  margin-top: 26px;
                  cursor: pointer;
                }
                
                #dialog-box .cross {
                    position: absolute;
                    top: 1rem;
                    font-size: 22px;
                    left: 20rem;
                    cursor: pointer;
                    color: #000000;
                    z-index: 1000;
                }
                
                .icons {
                  display: flex;
                  align-items: center;
                  gap: 10px;
                }
                
                .radio-icons {
                  margin-top: 1.5rem;
                  display: flex;
                  flex-direction: column;
                  gap: 8px;
                  font-size: 22px;
                }
                
                .date-btn {
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  gap: 10px;
                  margin-top: 30px;
                }
                
                .date-btn button {
                  padding: 12px;
                  width: 13rem;
                  background-color: white;
                  border: 1px solid #252b42d1;
                  border-radius: 16px;
                  color: #252b42d1;
                  cursor: pointer;
                }
                
                .time-btn {
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  gap: 10px;
                  margin-top: 30px;
                }
                
                .time-btn button {
                  padding: 10px;
                  width: 100%;
                  max-width: 6rem;
                  background-color: white;
                  border: 1px solid #252b42d1;
                  border-radius: 16px;
                  color: #252b42d1;
                  cursor: pointer;
                }
                
                .time-btn .grid-container {
                  display: grid;
                  margin: auto;
                  gap: 10px;
                  grid-template-columns: repeat(3, 1fr);
                }
                
                @media screen and (max-width: 768px) {
                  .time-btn button {
                    padding: 8px;
                  }
                }
                
                @media screen and (max-width: 480px) {
                  .time-btn button {
                    padding: 6px;
                  }
                
                  .time-btn .grid-container {
                    grid-template-columns: repeat(2, 1fr);
                  }
                }
                
                .cele {
                  width: 100%;
                  font-size: 5rem;
                  color: rebeccapurple;
                  margin-top: 2rem;
                }
          `;
    document.head.appendChild(style);
  }

  function showInterceptDialog(questionsArrayResponse) {
    questionsArray = questionsArrayResponse || [];
    currIndex = 0;
    const hasTimeQuestion = questionsArray.some(
      (question) => question.type === "TIME"
    );
    const hasDateQuestion = questionsArray.some(
      (question) => question.type === "DATES"
    );

    if (!hasTimeQuestion && hasDateQuestion) {
      questionsArray.push({
        id: questionsArray.length + 1,
        type: "TIME",
        buttonLabel: "Confirm",
      });
    }

    if (!email && !contact) {
      const hasTimeType = questionsArray.some(
        (question) => question.type === "TIME"
      );

      if (hasTimeType) {
        const dateIndex = questionsArray.findIndex(
          (question) => question.type === "DATES"
        );

        if (dateIndex !== -1) {
          questionsArray.splice(dateIndex, 0, {
            id: questionsArray.length + 1,
            type: "CONTACT_INFO",
            buttonLabel: "Next",
            text: "Please enter your contact information",
          });
        }
      }
    }

    const dialogBox = document.createElement("div");
    dialogBox.id = "dialog-box";

    const questionDialog = document.createElement("div");
    questionDialog.id = "question-dialog";

    displayQuestion(questionsArray[currIndex], questionDialog);

    const closeDiv = document.createElement("div");
    closeDiv.innerHTML = "✕";
    closeDiv.className = "cross";
    closeDiv.addEventListener("click", closeInterceptDialog);
    dialogBox.appendChild(closeDiv);
    dialogBox.appendChild(questionDialog);
    document.body.appendChild(dialogBox);
  }

  window.showInterceptDialog = showInterceptDialog;
  window.closeInterceptDialog = closeInterceptDialog;

  addCustomStyles();
})();