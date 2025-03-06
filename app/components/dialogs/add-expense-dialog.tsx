import { IoMdAdd } from "react-icons/io";
import {
  DialogActionTrigger,
  DialogBackdrop,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Field } from "../ui/field";
import { Button, Stack, Input, createListCollection } from "@chakra-ui/react";
import { NumberInputField, NumberInputRoot } from "../ui/number-input";
import {
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from "../ui/select";
import { useRef } from "react";

const AddExpenseDialog = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  return (
    <DialogRoot>
      <DialogBackdrop />
      <DialogTrigger asChild>
        <Button m="4" colorPalette="teal" variant="solid">
          <IoMdAdd /> Add expense
        </Button>
      </DialogTrigger>
      <DialogContent ref={contentRef}>
        <DialogCloseTrigger />
        <DialogHeader>
          <DialogTitle>Add expense</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <Stack gap="4">
            <Field label="Title" required>
              <Input placeholder="Groceries" />
            </Field>
            <Field label="Amount" required>
              <NumberInputRoot
                width="100%"
                defaultValue="0"
                formatOptions={{
                  style: "currency",
                  currency: "EUR",
                  currencyDisplay: "symbol",
                  currencySign: "accounting",
                }}
              >
                <NumberInputField />
              </NumberInputRoot>
            </Field>
            <Field label="Date" required>
              <Input type="date" />
            </Field>
            <SelectRoot collection={expenseCategories}>
              <SelectLabel>Category</SelectLabel>
              <SelectTrigger>
                <SelectValueText placeholder="Select category" />
              </SelectTrigger>
              <SelectContent portalRef={contentRef}>
                {expenseCategories.items.map((item) => (
                  <SelectItem item={item} key={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
          </Stack>
        </DialogBody>
        <DialogFooter>
          <DialogActionTrigger asChild>
            <Button variant="outline">Cancel</Button>
          </DialogActionTrigger>
          <Button>Save</Button>
        </DialogFooter>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  );
};

export default AddExpenseDialog;

const expenseCategories = createListCollection({
  items: [
    { label: "General", value: "general" },
    { label: "Groceries", value: "groceries" },
    { label: "Car", value: "car" },
    { label: "Culture", value: "culture" },
  ],
});
