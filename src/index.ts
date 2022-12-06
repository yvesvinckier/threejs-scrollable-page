import {
  ViewerApp,
  AssetManagerPlugin,
  GBufferPlugin,
  ProgressivePlugin,
  TonemapPlugin,
  SSRPlugin,
  SSAOPlugin,
  BloomPlugin,
  GammaCorrectionPlugin,
  MeshBasicMaterial2,
  Color,
  // Color, // Import THREE.js internals
  // Texture, // Import THREE.js internals
} from "webgi";
import "./styles.css";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

async function setupViewer() {
  // Initialize the viewer
  const viewer = new ViewerApp({
    canvas: document.getElementById("webgi-canvas") as HTMLCanvasElement,
    // isAntialiased: true,
  });

  // Add some plugins
  const manager = await viewer.addPlugin(AssetManagerPlugin);
  const camera = viewer.scene.activeCamera;
  const position = camera.position;
  const target = camera.target;
  const exitButton = document.querySelector(".button--exit") as HTMLElement;
  const customizerInterface = document.querySelector(
    ".customizer--container"
  ) as HTMLElement;

  // Add plugins individually.
  await viewer.addPlugin(GBufferPlugin);
  await viewer.addPlugin(new ProgressivePlugin(32));
  // await viewer.addPlugin(new TonemapPlugin(true));
  await viewer.addPlugin(new TonemapPlugin(!viewer.useRgbm));
  await viewer.addPlugin(GammaCorrectionPlugin);
  await viewer.addPlugin(SSRPlugin);
  await viewer.addPlugin(SSAOPlugin);
  await viewer.addPlugin(BloomPlugin);

  // This must be called once after all plugins are added.
  viewer.renderer.refreshPipeline();

  await manager.addFromPath("./assets/scene.glb");

  const drillMaterial = manager.materials!.findMaterialsByName(
    "FABRIC"
  )[0] as MeshBasicMaterial2;

  // viewer.getPlugin(TonemapPlugin)!.config!.clipBackground = true; // in case its set to false in the glb

  viewer.scene.activeCamera.setCameraOptions({ controlsEnabled: false });

  onUpdate();

  function setupScrollanimation() {
    const tl = gsap.timeline();

    // First section
    tl.to(position, {
      x: 0.0,
      y: 0.0,
      z: 3.25,
      scrollTrigger: {
        trigger: ".second",
        start: "top bottom",
        end: "top top",
        scrub: true,
        immediateRender: false,
      },
      onUpdate,
    })
      .to(".section--one--container", {
        yPercent: "-150",
        opacity: 0,
        scrollTrigger: {
          trigger: ".second",
          start: "top bottom",
          end: "top top",
          scrub: 1,
          immediateRender: false,
        },
      })
      .to(target, {
        x: 0,
        y: 0,
        z: 0,
        scrollTrigger: {
          trigger: ".second",
          start: "top bottom",
          end: "top top",
          scrub: true,
          immediateRender: false,
        },
      })
      // Last section

      .to(position, {
        x: -3.0,
        y: 0.0,
        z: 0.0,
        scrollTrigger: {
          trigger: ".third",
          start: "top bottom",
          end: "top top",
          scrub: true,
          immediateRender: false,
        },
        onUpdate,
      })
      .to(target, {
        x: 0,
        y: 0,
        z: 0,
        scrollTrigger: {
          trigger: ".third",
          start: "top bottom",
          end: "top top",
          scrub: true,
          immediateRender: false,
        },
      });
  }

  setupScrollanimation();

  // WEBBI UPDATE
  let needsUpdate = true;

  function onUpdate() {
    needsUpdate = true;
    viewer.renderer.resetShadows();
  }

  viewer.addEventListener("preFrame", () => {
    if (needsUpdate) {
      camera.positionTargetUpdated(true);
      needsUpdate = false;
    }
  });

  // KNOW MORE EVENT
  document.querySelector(".button--hero")?.addEventListener("click", () => {
    const element = document.querySelector(".second");
    window.scrollTo({
      top: element?.getBoundingClientRect().top,
      left: 0,
      behavior: "smooth",
    });
  });

  // SCROLL TO TOP
  document.querySelectorAll(".button--footer")?.forEach((item) => {
    item.addEventListener("click", () => {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    });
  });

  // CUSTOMIZE
  const sections = document.querySelector(".container") as HTMLElement;
  const webgiCanvasContainer = document.getElementById(
    "webgi-canvas-container"
  ) as HTMLElement;
  document
    .querySelector(".button--customize")
    ?.addEventListener("click", () => {
      sections.style.visibility = "hidden";
      webgiCanvasContainer.style.pointerEvents = "all";
      document.body.style.cursor = "grab";
      gsap.to(position, {
        x: -1.95,
        y: 1.54,
        z: 2.29,
        duration: 2,
        ease: "power3.inOut",
        onUpdate,
      });
      gsap.to(target, {
        x: 0,
        y: 0,
        z: 0,
        duration: 2,
        ease: "power3.inOut",
        onUpdate,
        onComplete: enableControlers,
      });
    });

  function enableControlers() {
    exitButton.style.visibility = "visible";
    customizerInterface.style.visibility = "visible";
    viewer.scene.activeCamera.setCameraOptions({ controlsEnabled: true });
  }

  // EXIT CUSTOMIZE
  exitButton.addEventListener("click", () => {
    gsap.to(position, {
      x: -3.0,
      y: 0.0,
      z: 0.0,
      duration: 1,
      ease: "power3.inOut",
      onUpdate,
    });
    gsap.to(target, {
      x: 0,
      y: 0,
      z: 0,
      duration: 1,
      ease: "power3.inOut",
      onUpdate,
    });
    viewer.scene.activeCamera.setCameraOptions({ controlsEnabled: false });
    sections.style.visibility = "visible";
    webgiCanvasContainer.style.pointerEvents = "none";
    document.body.style.cursor = "default";
    exitButton.style.visibility = "hidden";
    customizerInterface.style.visibility = "hidden";
  });

  document
    .querySelector(".button--colors.violet")
    ?.addEventListener("click", () => {
      changeColor(new Color(0xaa83aa).convertSRGBToLinear());
    });

  document
    .querySelector(".button--colors.red")
    ?.addEventListener("click", () => {
      changeColor(new Color(0xa57d7d).convertSRGBToLinear());
    });

  document
    .querySelector(".button--colors.green")
    ?.addEventListener("click", () => {
      changeColor(new Color(0x96b2a1).convertSRGBToLinear());
    });

  function changeColor(_colorToBeChanged: Color) {
    drillMaterial.color = _colorToBeChanged;
    viewer.scene.setDirty();
  }
}

setupViewer();
