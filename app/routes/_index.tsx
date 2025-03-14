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
} from "../components/ui/dialog";
import { Field } from "../components/ui/field";
import { Button, Stack, Input } from "@chakra-ui/react";
import {
  NumberInputField,
  NumberInputRoot,
} from "../components/ui/number-input";
import {
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
} from "../components/ui/select";
import { useEffect, useRef, useState } from "react";
import { CreateExpense, createExpense } from "~/db/expense.server";
import { useFetcher } from "@remix-run/react";
import { Category } from "@prisma/client";
import { ActionFunctionArgs } from "@remix-run/node";
import { InputGroup } from "~/components/ui/input-group";
import { FaEuroSign } from "react-icons/fa";
import { EXPENSE_CATEGORIES } from "~/utils/constants";

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();

  const convertedAmount = (formData.get("amount") as string)
    .replace(/\./g, "")
    .replace(/,/g, ".");

  const expenseData: CreateExpense = {
    amount: parseFloat(convertedAmount),
    category: formData.get("category") as Category,
    expenseDate: new Date(formData.get("date") as string),
    title: formData.get("title") as string,
  };

  const createdExpense = await createExpense(expenseData);
  return createdExpense;
};

const Index = () => {
  const contentRef = useRef<HTMLDivElement>(null);
  const fetcher = useFetcher();

  const [openExpenseDialog, setOpenExpenseDialog] = useState(false);
  const isSubmitting = fetcher.state === "submitting";

  useEffect(() => {
    if (fetcher.data) {
      setOpenExpenseDialog(false);
    }
  }, [fetcher.data]);

  return (
    <DialogRoot
      open={openExpenseDialog}
      onOpenChange={(e) => setOpenExpenseDialog(e.open)}
    >
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
            <fetcher.Form id="expenseForm" method="post">
              <Field label="Title" required>
                <Input name="title" placeholder="Groceries" />
              </Field>
              <Field label="Amount" required>
                <NumberInputRoot
                  allowMouseWheel
                  width="100%"
                  name="amount"
                  locale="de-DE"
                  defaultValue="0"
                  formatOptions={{
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 2,
                  }}
                >
                  <InputGroup width={"100%"} startElement={<FaEuroSign />}>
                    <NumberInputField pattern="\d{1,3}(.\d{3})*(,\d{2})?" />
                  </InputGroup>
                </NumberInputRoot>
              </Field>
              <Field label="Date" required>
                <Input name="date" type="date" />
              </Field>
              <SelectRoot name="category" collection={EXPENSE_CATEGORIES}>
                <SelectLabel>Category</SelectLabel>
                <SelectTrigger>
                  <SelectValueText placeholder="Select category" />
                </SelectTrigger>
                <SelectContent portalRef={contentRef}>
                  {EXPENSE_CATEGORIES.items.map((item) => (
                    <SelectItem item={item} key={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectRoot>
              <Input visibility="hidden" type="submit" id="submit-form" />
            </fetcher.Form>
          </Stack>
        </DialogBody>
        <DialogFooter>
          <DialogActionTrigger asChild>
            <Button type="submit" variant="outline">
              Cancel
            </Button>
          </DialogActionTrigger>
          <Button loading={isSubmitting} form="expenseForm" type="submit">
            Save
          </Button>
        </DialogFooter>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRoot>
  );
};

export default Index;
