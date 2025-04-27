import React from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
} from "@mui/material";

const RemoveMemberDialog = ({ open, onClose, onConfirm, memberId }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Confirm Removal</DialogTitle>
      <DialogContent>
        Are you sure you want to remove this member from the group?
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button
          onClick={() => {
            onConfirm(memberId);
            onClose();
          }}
          color="secondary"
        >
          Yes, Remove
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RemoveMemberDialog;
