import React from "react";
import {useModal} from "../../contexts/ModalContext";
import BaseModal from "./BaseModal";
import LoaderContent from "./content/Loader";
import EmailConfirmationContent from "./content/EmailConfirmation";
import ConfirmationContent from "./content/Confirmation";
import {MODAL_TYPES} from "../constants/ModalTypes";

export default function GlobalModal() {
    const {modal, hideModal} = useModal();
    const customOnClose = modal.props?.onClose || hideModal;

    if (!modal.type) return null;

    return (
        <BaseModal visible={!!modal.type} onClose={customOnClose}>
            {modal.type === MODAL_TYPES.LOADING && <LoaderContent animationType="none"/>}
            {modal.type === MODAL_TYPES.EMAIL_CONFIRMATION && (
                <EmailConfirmationContent {...modal.props} onClose={customOnClose}/>
            )}
            {modal.type === MODAL_TYPES.CONFIRMATION && <ConfirmationContent {...modal.props} onClose={customOnClose}/>}
        </BaseModal>
    );
}

