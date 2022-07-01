(async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  const examples = [
    "basic",
    "batching",
    // "buffers",
    "camera",
    "color-mask",
    "cubemap",
    "fullscreen",
    "image",
    "instancing",
    "picking",
    "primitives",
    "project",
    "render-to-cubemap",
    "render-to-texture",
    "shadows",
    "sub-pass",
    // "test",
    "unindexed",
    "vao",
    "vao-instanced",
  ];
  window.pexExamples = examples;

  const list = document.querySelector(".Examples-list");
  if (params.has("screenshot")) {
    list.classList.add("u-hide");
  } else if (id) {
    list.classList.add("Examples-list--side");
  }

  list.innerHTML = examples.reduce(
    (html, example) =>
      (html += `<div class="Examples-list-item"><a href="?id=${example}">
      <img src="${new URL(
        `screenshots/${example}.png`,
        import.meta.url
      )}" /><h3>${example}</h3></a></div>`),
    !id
      ? ""
      : '<div class="Examples-list-item"><a href="/"><h3>home</h3></a></div>'
  );

  if (id) {
    document.querySelector(".MainHeader").remove();
    document.querySelector("body").style.backgroundColor = getComputedStyle(
      document.body
    ).getPropertyValue("--color-grey");

    try {
      await importShim(new URL(`${id}.js`, import.meta.url).toString());
    } catch (error) {
      console.error(error);
    }

    list.querySelector(`a[href="?id=${id}"]`)?.scrollIntoView(true);
  }
})();
