console.log("WaterlooWorks Scanner loaded");

let scanning = false;


chrome.runtime.onMessage.addListener(
  (request, sender, sendResponse) => {

    if (request.action === "scanAllJobs") {

      if (scanning) {

        sendResponse({
          error: "Scan already running"
        });

        return;
      }

      scanning = true;

      scanAllJobs()
        .then(result => {

          scanning = false;

          sendResponse(result);

        })
        .catch(error => {

          scanning = false;

          console.error(error);

          sendResponse({
            error: error.message
          });

        });

      return true;
    }

  }
);


/* ================================
   扫描全部职位
================================ */

async function scanAllJobs() {

  const jobs = findJobs();

  if (jobs.length === 0) {
    throw new Error("No WaterlooWorks jobs found.");
  }


  createProgressBox();


  let clear = 0;
  let review = 0;
  let restricted = 0;
  let failed = 0;


  for (let i = 0; i < jobs.length; i++) {

    const job = jobs[i];

    updateProgress(
      i + 1,
      jobs.length,
      job.id,
      job.title
    );


    try {

      console.log(
        `Scanning ${i + 1}/${jobs.length}`,
        job.id,
        job.title
      );


      /*
        点击职位标题
      */

      safeOpenJob(job.link);


      /*
        等待详情弹窗
      */

      const modal =
        await waitForModal();


      /*
        给页面一点加载正文的时间
      */

      await sleep(500);


      const text =
        modal.innerText;


      /*
        判断身份限制
      */

      const result =
        classifyEligibility(text);


      /*
        在列表行显示结果
      */

      addResultBadge(
        job.row,
        result
      );


      if (result.type === "clear") {
        clear++;
      }

      else if (result.type === "review") {
        review++;
      }

      else if (result.type === "restricted") {
        restricted++;
      }


      /*
        关闭职位详情
      */

      closeModal(modal);


      /*
        等待弹窗真正消失
      */

      await waitForModalToClose();


      /*
        不要扫描太快
      */

      await sleep(600);

    }

    catch (error) {

      console.error(
        "Failed:",
        job.id,
        error
      );


      failed++;


      addResultBadge(
        job.row,
        {
          type: "failed",
          label: "⚪ Failed",
          reason: "Could not read posting"
        }
      );


      /*
        尝试按 ESC 关闭残留弹窗
      */

      document.dispatchEvent(
        new KeyboardEvent(
          "keydown",
          {
            key: "Escape",
            code: "Escape",
            bubbles: true
          }
        )
      );


      await sleep(800);
    }

  }


  finishProgress(
    jobs.length,
    clear,
    review,
    restricted,
    failed
  );


  return {
    total: jobs.length,
    clear,
    review,
    restricted,
    failed
  };
}


/* ================================
   找列表中的职位
================================ */

function findJobs() {

  const rows =
    Array.from(
      document.querySelectorAll("tr")
    );


  const jobs = [];


  for (const row of rows) {

    const text =
      row.innerText.trim();


    const idMatch =
      text.match(/\b\d{6}\b/);


    if (!idMatch) {
      continue;
    }


    const links =
      Array.from(
        row.querySelectorAll("a")
      );


    /*
      找真正有职位名称文字的链接
      排除图标和空链接
    */

    const titleLink =
      links.find(link => {

        const title =
          link.innerText.trim();

        return (
          title.length > 3 &&
          !/^\d+$/.test(title)
        );

      });


    if (!titleLink) {
      continue;
    }


    jobs.push({
      id: idMatch[0],
      title: titleLink.innerText.trim(),
      link: titleLink,
      row: row
    });

  }


  console.log(
    "Jobs found:",
    jobs.length
  );


  return jobs;
}


/* ================================
   等待职位详情弹窗
================================ */

function waitForModal() {

  return new Promise(
    (resolve, reject) => {

      let attempts = 0;


      const timer =
        setInterval(() => {

          attempts++;


          const candidates =
            Array.from(
              document.querySelectorAll(`
                [role="dialog"],
                .modal,
                .modal-dialog,
                .modal-content
              `)
            );


          const modal =
            candidates.find(element => {

              const rect =
                element.getBoundingClientRect();


              const text =
                element.innerText || "";


              return (
                rect.width > 500 &&
                rect.height > 300 &&
                text.length > 100
              );

            });


          if (modal) {

            clearInterval(timer);

            resolve(modal);

            return;
          }


          if (attempts > 40) {

            clearInterval(timer);

            reject(
              new Error(
                "Job detail window not detected."
              )
            );

          }

        }, 200);

    }
  );

}


/* ================================
   等待弹窗关闭
================================ */

function waitForModalToClose() {

  return new Promise(resolve => {

    let attempts = 0;


    const timer =
      setInterval(() => {

        attempts++;


        const visibleModal =
          Array.from(
            document.querySelectorAll(`
              [role="dialog"],
              .modal,
              .modal-dialog,
              .modal-content
            `)
          )
          .find(element => {

            const rect =
              element.getBoundingClientRect();

            return (
              rect.width > 500 &&
              rect.height > 300
            );

          });


        if (!visibleModal) {

          clearInterval(timer);

          resolve();

          return;
        }


        if (attempts > 20) {

          clearInterval(timer);

          resolve();

        }

      }, 150);

  });

}


/* ================================
   身份限制判断
================================ */

function classifyEligibility(text) {

  const lower =
    text.toLowerCase();


  const restricted = [

    "canadian citizen",

    "canadian citizenship",

    "permanent resident",

    "u.s. citizen",

    "us citizen",

    "citizens only",

    "citizenship required",

    "must be a citizen",

    "must be canadian",

    "controlled goods"

  ];


  const review = [

    "security clearance",

    "work authorization",

    "authorized to work",

    "legally entitled to work",

    "eligible to work",

    "without sponsorship",

    "visa sponsorship",

    "itar",

    "export control"

  ];


  for (const word of restricted) {

    if (lower.includes(word)) {

      return {

        type: "restricted",

        label:
          "🔴 Restricted",

        reason:
          word

      };

    }

  }


  for (const word of review) {

    if (lower.includes(word)) {

      return {

        type: "review",

        label:
          "🟡 Review",

        reason:
          word

      };

    }

  }


  return {

    type:
      "clear",

    label:
      "🟢 Clear",

    reason:
      "No obvious restriction"

  };

}


/* ================================
   把结果写回职位列表
================================ */

function addResultBadge(
  row,
  result
) {

  /*
    如果以前扫描过，先删旧结果
  */

  const oldBadge =
    row.querySelector(
      ".ww-eligibility-result"
    );


  if (oldBadge) {
    oldBadge.remove();
  }


  const badge =
    document.createElement("span");


  badge.className =
    "ww-eligibility-result";


  badge.innerText =
    result.label;


  badge.title =
    result.reason;


  /*
    样式
  */

  badge.style.marginLeft =
    "10px";

  badge.style.padding =
    "3px 7px";

  badge.style.borderRadius =
    "5px";

  badge.style.fontSize =
    "11px";

  badge.style.fontWeight =
    "bold";

  badge.style.whiteSpace =
    "nowrap";


  if (
    result.type === "clear"
  ) {

    badge.style.background =
      "#dcfce7";

    badge.style.color =
      "#166534";

  }


  else if (
    result.type === "review"
  ) {

    badge.style.background =
      "#fef3c7";

    badge.style.color =
      "#92400e";

  }


  else if (
    result.type === "restricted"
  ) {

    badge.style.background =
      "#fee2e2";

    badge.style.color =
      "#991b1b";

  }


  else {

    badge.style.background =
      "#e5e7eb";

    badge.style.color =
      "#374151";

  }


  /*
    放到职位 Title 后面
  */

  const links =
    Array.from(
      row.querySelectorAll("a")
    );


  const titleLink =
    links.find(link => {

      const title =
        link.innerText.trim();

      return (
        title.length > 3 &&
        !/^\d+$/.test(title)
      );

    });


  if (titleLink) {

    titleLink.insertAdjacentElement(
      "afterend",
      badge
    );

  }

}


/* ================================
   关闭职位详情
================================ */

function closeModal(modal) {

  const buttons =
    Array.from(
      modal.querySelectorAll(
        "button, a"
      )
    );


  const closeButton =
    buttons.find(button => {

      const text =
        (
          (button.innerText || "") +
          " " +
          (button.getAttribute(
            "aria-label"
          ) || "") +
          " " +
          (button.title || "")
        )
        .toLowerCase();


      return (
        text.includes("close") ||
        text.includes("×")
      );

    });


  if (closeButton) {

    closeButton.click();

    return;
  }


  document.dispatchEvent(
    new KeyboardEvent(
      "keydown",
      {
        key: "Escape",
        code: "Escape",
        bubbles: true
      }
    )
  );

}


/* ================================
   页面扫描进度框
================================ */

function createProgressBox() {

  const old =
    document.getElementById(
      "ww-scan-progress"
    );


  if (old) {
    old.remove();
  }


  const box =
    document.createElement("div");


  box.id =
    "ww-scan-progress";


  box.style.position =
    "fixed";

  box.style.right =
    "20px";

  box.style.bottom =
    "20px";

  box.style.zIndex =
    "999999";

  box.style.background =
    "#111827";

  box.style.color =
    "white";

  box.style.padding =
    "14px 18px";

  box.style.borderRadius =
    "8px";

  box.style.fontFamily =
    "Arial";

  box.style.fontSize =
    "13px";

  box.style.boxShadow =
    "0 4px 15px rgba(0,0,0,.3)";


  box.innerText =
    "Starting scan...";


  document.body.appendChild(box);
}


/* ================================
   更新进度
================================ */

function updateProgress(
  current,
  total,
  id,
  title
) {

  const box =
    document.getElementById(
      "ww-scan-progress"
    );


  if (!box) {
    return;
  }


  box.innerText =
    `Scanning ${current} / ${total}\n` +
    `${id}  ${title}`;

}


/* ================================
   扫描完成
================================ */

function finishProgress(
  total,
  clear,
  review,
  restricted,
  failed
) {

  const box =
    document.getElementById(
      "ww-scan-progress"
    );


  if (!box) {
    return;
  }


  box.innerText =
    `✓ Scan Complete\n\n` +
    `Total: ${total}\n` +
    `🟢 ${clear}   🟡 ${review}   🔴 ${restricted}   ⚪ ${failed}`;

}


/* ================================
   延迟工具
================================ */
function safeOpenJob(link) {

  const stopJavascriptNavigation = (event) => {

    const href =
      link.getAttribute("href") || "";

    if (
      href
        .trim()
        .toLowerCase()
        .startsWith("javascript:")
    ) {
      event.preventDefault();
    }

  };

  link.addEventListener(
    "click",
    stopJavascriptNavigation,
    { once: true }
  );

  link.dispatchEvent(
    new MouseEvent(
      "click",
      {
        bubbles: true,
        cancelable: true,
        view: window
      }
    )
  );
}
function sleep(ms) {

  return new Promise(
    resolve =>
      setTimeout(resolve, ms)
  );

}