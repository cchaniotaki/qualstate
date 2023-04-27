

// check não é necessário, já é interpretado como click()

async function inputElements(page, elements) {
    await page.evaluate((elements) => {
      for (let i = 0; i < elements.length; i++) {
        let tag = document.getElementById(elements.id).nodeName
        if (tag == "INPUT") {
          let type = tag.type;
          switch (type) {
            case 'checkbox':
              type.checked = elements.value;
              break;
            default:
              break;
          }
        } else {
          switch (tag) {
            case 'p':
              // type.checked = elements.value;
              break;
            default:
              break;
          }
        }
      }
    }, elements);
  }