import React, { useState, useLayoutEffect, createRef } from "react";

function Modal(props) {
  const { close, contentRef } = props;
  const outerStyle = {
    position: "fixed",
    left: 0,
    top: 0,
    width: "100%",
    height: "100%",
    cursor: "default",
  };
  const innerStyle = {
    position: "fixed",
    left: props.left,
    top: props.top,
  };
  const handleClick = (e) => {
    e.stopPropagation();
    close();
  };
  return (
    <div style={outerStyle} onClick={handleClick}>
      <div ref={contentRef} style={innerStyle}>
        {props.children}
      </div>
    </div>
  );
}

export function useModal(children) {
  let [showingModal, setShowingModal] = useState(false);
  let [modalLeft, setModalLeft] = useState(0);
  let [modalTop, setModalTop] = useState(0);
  const showModal = (e) => {
    setModalTop(e.clientY);
    setModalLeft(e.clientX);
    setShowingModal(true);
  };

  const contentRef = createRef();
  let [maxLeft, setMaxLeft] = useState(0);
  useLayoutEffect(() => {
    setMaxLeft(window.innerWidth - (contentRef.current?.clientWidth ?? 0));
  }, [showingModal, contentRef]);

  const clampedLeft = Math.max(0, Math.min(modalLeft, maxLeft));

  return [
    (children) =>
      showingModal && (
        <Modal
          left={clampedLeft}
          top={modalTop}
          contentRef={contentRef}
          close={() => setShowingModal(false)}
        >
          {children}
        </Modal>
      ),
    showModal,
  ];
}
