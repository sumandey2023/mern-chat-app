import React from "react";
import { TextField, Button } from "@mui/material";
import { useSelector } from "react-redux";

const CreateGroup = () => {
  const lightTheme = useSelector((state) => state.themeKey);

  return (
    <div
      className={`bg-gray-100 flex items-center justify-center min-h-screen p-4 ${
        lightTheme ? "" : "!bg-[#181C14]"
      }`}
    >
      <div
        className={`rounded-2xl shadow-lg p-8 w-full max-w-sm bg-white ${
          lightTheme ? "" : "!bg-[#3C3D37]"
        }`}
      >
        <h1
          className={`text-3xl font-bold mb-6 text-center text-gray-800 ${
            lightTheme ? "" : "!text-white"
          }`}
        >
          Create New Group
        </h1>
        <p
          className={`text-center mb-6 text-gray-600 ${
            lightTheme ? "" : "!text-gray-300"
          }`}
        >
          Start a new group chat with your friends
        </p>

        <div className="flex flex-col gap-4 w-full">
          <TextField
            label="Group Name"
            variant="outlined"
            fullWidth
            className="rounded-lg"
            InputProps={{
              style: { borderRadius: "8px" },
              className: lightTheme ? "" : "!text-white",
            }}
          />
          <TextField
            label="Group Description"
            variant="outlined"
            fullWidth
            multiline
            rows={3}
            className="rounded-lg"
            InputProps={{
              style: { borderRadius: "8px" },
              className: lightTheme ? "" : "!text-white",
            }}
          />
        </div>

        <div className="mt-6">
          <Button
            variant="contained"
            color="primary"
            fullWidth
            className="py-3 text-lg rounded-2xl shadow-md hover:bg-blue-600 transition-all"
          >
            Create Group
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroup;
