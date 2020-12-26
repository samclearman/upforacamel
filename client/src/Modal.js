import React, { useState } from "react";

function Modal(props) {
  const { close } = props;
  const outerStyle = {
    position: "absolute",
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
      <div style={innerStyle}>{props.children}</div>
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
  return [
    (children) =>
      showingModal && (
        <Modal
          left={modalLeft}
          top={modalTop}
          close={() => setShowingModal(false)}
        >
          {children}
        </Modal>
      ),
    showModal,
  ];
}
