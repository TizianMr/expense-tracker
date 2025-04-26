import { RiUserLine } from '@remixicon/react';
import {
  Button,
  Dialog,
  DialogPanel,
  Divider,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
  TextInput,
} from '@tremor/react';
import { useState } from 'react';

import { useDelayedNavigation } from '~/customHooks/useDelayedNavigation';

const AccountSettings = () => {
  const [open, setIsOpen] = useState(true);
  const { triggerDelayedNavigation } = useDelayedNavigation('/dashboard');

  const handleClose = () => {
    setIsOpen(false);
    triggerDelayedNavigation(); // delay navigation to allow dialog to close with animation
  };

  return (
    <Dialog
      static
      open={open}
      onClose={handleClose}>
      <DialogPanel className='w-[40vw] big-dialog'>
        <h3 className='text-lg font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong'>
          Account Settings
        </h3>
        <div className='flex'>
          <div className='w-[60%] flex flex-col space-y-2 justify-center items-center pt-4'>
            <span
              aria-hidden='true'
              className='hidden h-20 w-20 shrink-0 items-center justify-center rounded-full border border-gray-300 bg-white overflow-hidden sm:flex dark:border-gray-800 dark:bg-gray-950'>
              <RiUserLine />
            </span>
            <div className='truncate text-center'>
              <p className='text-tremor-default text-tremor-content-strong truncate'>Max Muster</p>
              <p className='text-tremor-default text-tremor-content dark:text-dark-tremor-content truncate'>
                max.muster@gmail.com
              </p>
            </div>
          </div>

          <TabGroup defaultIndex={0}>
            <TabList variant='line'>
              <Tab>Change Email</Tab>
              <Tab>Change Password</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <div className='space-y-4'>
                  <div>
                    <label
                      className='text-tremor-default font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong'
                      htmlFor='password'>
                      New Email <span className='text-red-500'>*</span>
                    </label>
                    <TextInput
                      autoComplete='email'
                      className='mt-2'
                      id='password'
                      name='password'
                      placeholder='john@company.com'
                      type='email'
                    />
                  </div>
                  <div>
                    <label
                      className='text-tremor-default font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong'
                      htmlFor='password'>
                      Confirm new Email <span className='text-red-500'>*</span>
                    </label>
                    <TextInput
                      autoComplete='email'
                      className='mt-2'
                      id='password'
                      name='password'
                      placeholder='john@company.com'
                      type='email'
                    />
                  </div>
                  <Button className='w-full'>Change</Button>
                </div>
              </TabPanel>
              <TabPanel>
                <div className='space-y-4'>
                  <div>
                    <label
                      className='text-tremor-default font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong'
                      htmlFor='password'>
                      Old password <span className='text-red-500'>*</span>
                    </label>
                    <TextInput
                      autoComplete='password'
                      className='mt-2'
                      id='password'
                      name='password'
                      placeholder='password'
                      type='password'
                    />
                  </div>
                  <div>
                    <label
                      className='text-tremor-default font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong'
                      htmlFor='password'>
                      New password <span className='text-red-500'>*</span>
                    </label>
                    <TextInput
                      autoComplete='password'
                      className='mt-2'
                      id='password'
                      name='password'
                      placeholder='password'
                      type='password'
                    />
                  </div>
                  <div>
                    <label
                      className='text-tremor-default font-semibold text-tremor-content-strong dark:text-dark-tremor-content-strong'
                      htmlFor='password'>
                      Confirm new password <span className='text-red-500'>*</span>
                    </label>
                    <TextInput
                      autoComplete='password'
                      className='mt-2'
                      id='password'
                      name='password'
                      placeholder='password'
                      type='password'
                    />
                  </div>
                  <Button className='w-full'>Change</Button>
                </div>
              </TabPanel>
            </TabPanels>
          </TabGroup>
        </div>

        <Divider />
        <div className='mt-8 flex items-center justify-end space-x-2'>
          <Button
            variant='secondary'
            onClick={handleClose}>
            Close
          </Button>
        </div>
      </DialogPanel>
    </Dialog>
  );
};

export default AccountSettings;
