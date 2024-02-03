import "./App.css";
import {
  ChakraProvider,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Button,
  CheckboxGroup,
  Stack,
  Checkbox,
} from "@chakra-ui/react";
import readXlsxFile, { readSheetNames } from "read-excel-file";
import { processSheet } from "./utils";
import { useState } from "react";

function App() {
  const [sheetNames, setSheetNames] = useState([]);
  const [selectedSheets, setSelectedSheets] = useState([]);
  const [file, setFile] = useState(null);

  const toast = useToast();

  async function onSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const file = formData.get("plik");
    console.log("!@# file", file);
    if (!file || !file.name) {
      return toast({ status: "error", title: "Musisz wgrać plik" });
    }

    if (
      file.type !==
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      return toast({
        status: "error",
        title: "Plik ma zły format. Wgraj plik .xlsl",
      });
    }

    const sheetNames = await readSheetNames(file);

    if (sheetNames.length === 0) {
      return toast({ status: "error", title: "Plik jest pusty." });
    }

    setSheetNames(sheetNames);
    setSelectedSheets(sheetNames);
    setFile(file);
  }

  async function onModalSubmit() {
    try {
      for (const sheet of selectedSheets) {
        let data = await readXlsxFile(file, { sheet });
        const csvContent = processSheet(data);
        const sheetNameEscaped = sheet.replaceAll(" ", "-");
        const blob = new Blob([csvContent], { type: "text/csv" });
        const elem = window.document.createElement("a");
        elem.href = window.URL.createObjectURL(blob);
        elem.download = `targets-${sheetNameEscaped}.csv`;
        document.body.appendChild(elem);
        elem.click();
        document.body.removeChild(elem);
      }

      setSheetNames([]);
      setSelectedSheets([]);
      setFile(null);
    } catch (error) {
      return toast({
        status: "error",
        title: "Coś poszło nie tak",
        description: error,
      });
    }
  }

  return (
    <ChakraProvider>
      <div className="App" onSubmit={onSubmit}>
        <form className="form">
          <input name="plik" type="file" />
          <Button type="submit">Generuj</Button>
        </form>
      </div>
      <Modal isOpen={sheetNames.length > 0} onClose={() => setSheetNames([])}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            Wybierz arkusze dla których chcesz wygenerować rozpiskę
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <CheckboxGroup
              value={selectedSheets}
              onChange={(newValue) => setSelectedSheets(newValue)}
            >
              <Stack direction="column">
                {sheetNames.map((name) => (
                  <Checkbox key={name} value={name}>
                    {name}
                  </Checkbox>
                ))}
              </Stack>
            </CheckboxGroup>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onModalSubmit}>Generuj</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </ChakraProvider>
  );
}

export default App;
