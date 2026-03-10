// import gsap from "gsap";
// import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);
// steps for anime
// map through all the images and reduce the scale and translate y values to have the jut up
// monitor the wheel event and detect where the user wants to scroll to (top or bottom)
// if (top) animate the first image to scale up and opacity out,
// if (top) then change the z-index to the lowest so it's at the back of the stack and then re-implement the initial scale and translate
// if (bottom) opacity out the last image, change it's z-index to the highest and then scale that in and re-implement the stack

function getZIndex(nodeList, type = "highest") {
  return Array.from(nodeList).reduce(
    (acc, node) => {
      const zIndex = parseInt(getComputedStyle(node).zIndex) || 0;
      if (type === "highest") {
        return zIndex > acc ? zIndex : acc;
      } else {
        return zIndex < acc ? zIndex : acc;
      }
    },
    type === "highest" ? -Infinity : Infinity,
  );
}
document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(SplitText);
  const scaleFactor = 0.06;
  const translateYFactor = 40;
  let baseZIndex = 1147483647;
  let isAnimating = false;

  const factorArray = [];

  const slideData = [
    { title: "Wind Stance", image: "images/slider_img_1.jpg" },
    { title: "Calm Focus", image: "images/slider_img_2.jpg" },
    { title: "Red Profile", image: "images/slider_img_3.jpg" },
    { title: "Warm Casual", image: "images/slider_img_4.jpg" },
    { title: "Soft Gaze", image: "images/slider_img_5.jpg" },
  ];

  const stack = document.querySelector(".stack");

  slideData.forEach((slide, index) => {
    const slideElement = document.createElement("div");
    slideElement.classList.add("slide");
    slideElement.innerHTML = `
            <img src="${slide.image}" alt="${slide.title}">
            <h2>${slide.title}</h2>
        `;
    stack.appendChild(slideElement);
    factorArray.push(index);
  });

  Array.from(stack.children).forEach((slide, index) => {
    gsap.set(slide, {
      scale: 1 - factorArray[index] * scaleFactor,
      y: factorArray[index] * -translateYFactor,
      zIndex: baseZIndex - index,
    });
  });

  let scrollTimeout;

  window.addEventListener("wheel", (event) => {
    clearTimeout(scrollTimeout);

    scrollTimeout = setTimeout(() => {
      const direction = event.deltaY > 0 ? "up" : "down";

      if (isAnimating) {
        return;
      }

      isAnimating = true;

      if (direction === "up") {
        const activeTL = gsap.timeline({
          onComplete: () => {
            isAnimating = false;
          },
        });

        const activeSlide = stack.children[factorArray.indexOf(0)];

        const activeSlideIndex = factorArray.indexOf(0);

        const removed = factorArray.pop();

        factorArray.unshift(removed);

        const newActiveSlide = stack.children[factorArray.indexOf(0)];

        const newZIndex = getZIndex(stack.children, "lowest") - 1;
        

        let wordsInstance = null;

        activeTL
          .add(() => {
            wordsInstance = SplitText.create(newActiveSlide.querySelector("h2"), {
              type: "words, chars",
              onSplit(self) {
                gsap.set(self.words, {
                  y: "30%",
                  autoAlpha: 0,
                });
              },
            });
            
          })
          .to(activeSlide, {
            y: 100,
            scale: 1.12,
            opacity: 0,
            duration: 0.8,
            ease: "power2.out",
          })
          .add(() => {
            Array.from(stack.children).forEach((slide, index) => {
              if (slide === activeSlide) return;
              gsap.to(slide, {
                scale: 1 - factorArray[index] * scaleFactor,
                y: factorArray[index] * -translateYFactor,
                duration: 0.4,
                ease: "power2.out",
              });
            });
          }, "<")
          .set(activeSlide, {
            zIndex: newZIndex,
            scale: 1 - factorArray[activeSlideIndex] * scaleFactor,
            duration: 0.1,
          })
          .fromTo(
            activeSlide,
            {
              y: 0,
            },
            {
              opacity: 1,
              y: (factorArray.length - 1) * -translateYFactor,
              duration: 0.2,
              ease: "power2.inOut",
            },
            "<",
          )
          .add(() => {
            gsap.to(wordsInstance?.words, {
              y: '0%',
              autoAlpha: 1,
              duration: 0.3,
              stagger: 0.05,
              ease: "power2.inOut",
            })

          })
      } else {
        const activeTL = gsap.timeline({
          onComplete: () => {
            isAnimating = false;
          },
        });

        let wordsInstance = null;

        const activeSlide =
          stack.children[factorArray.indexOf(factorArray.length - 1)];

        const removed = factorArray.shift();

        factorArray.push(removed);

        const newZIndex = getZIndex(stack.children, "highest") + 1;

        activeTL
          .add(() => {
            wordsInstance = SplitText.create(activeSlide.querySelector("h2"), {
              type: "words, chars",
              onSplit(self) {
                gsap.set(self.words, {
                  y: "30%",
                  autoAlpha: 0,
                });
              },
            });
          })
          .to(activeSlide, {
            y: -100,
            opacity: 0,
            duration: 0.5,
            ease: "power2.out",
          })
          .add(() => {
            Array.from(stack.children).forEach((slide, index) => {
              gsap.to(slide, {
                scale: 1 - factorArray[index] * scaleFactor,
                y: factorArray[index] * -translateYFactor,
                duration: 0.5,
                ease: "power2.out",
              });
            });
          }, "<")
          .set(activeSlide, {
            zIndex: newZIndex,
          })
          .fromTo(
            activeSlide,
            { opacity: 0, y: translateYFactor },
            {
              opacity: 1,
              y: 0,
              duration: 0.5,
              ease: "power2.inOut",
            },
          )
          .add(() => {
            gsap.to(wordsInstance?.words, {
              y: '0%',
              autoAlpha: 1,
              duration: 0.3,
              stagger: 0.05,
              ease: "power2.inOut",
            })
          })
      }
    }, 20);
  });
});
