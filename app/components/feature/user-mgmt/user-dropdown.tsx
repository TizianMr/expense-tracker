import { useSubmit } from '@remix-run/react';
import { RiArrowDownSLine, RiLogoutCircleLine, RiSettings2Line, RiUserLine } from '@remixicon/react';
import { Button } from '@tremor/react';
import { useTranslation } from 'react-i18next';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../ui/dropdown';
import CustomNavLink from '~/components/ui/custom-navlink';
import { Tooltip } from '~/components/ui/tooltip';
import { AuthUser } from '~/db/auth.server';

type Props = {
  userInfo: AuthUser;
};

const UserDropdown = ({ userInfo }: Props) => {
  const submit = useSubmit();
  const { t } = useTranslation();

  return (
    <div className='flex justify-end'>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='light'>
            <div className='flex space-x-2 justify-end items-center'>
              <span
                aria-hidden='true'
                className='hidden h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gray-300 bg-white overflow-hidden md:flex dark:border-gray-800 dark:bg-gray-950 object-contain'>
                {userInfo.profilePicture ? (
                  <img
                    alt='avatar'
                    src={userInfo.profilePicture}
                  />
                ) : (
                  <RiUserLine />
                )}
              </span>

              <div className='truncate'>
                <p className='text-tremor-default text-left truncate'>{`${userInfo.firstName} ${userInfo.lastName}`}</p>
                <p className='text-tremor-default text-tremor-content dark:text-dark-tremor-content truncate'>
                  {userInfo.email}
                </p>
              </div>
              <RiArrowDownSLine className='shrink-0' />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          {userInfo.isDemo ? (
            <Tooltip
              content={'Unable to access account settings in demo mode.'}
              showArrow={false}>
              <DropdownMenuItem disabled>
                <span className='flex items-center gap-x-2'>
                  <RiUserLine className='size-4 text-inherit' /> <span>Account Settings</span>
                </span>
              </DropdownMenuItem>
            </Tooltip>
          ) : (
            <NavLink to='account'>
              <DropdownMenuItem>
                <span className='flex items-center gap-x-2'>
                  <RiUserLine className='size-4 text-inherit' /> <span>{t('UserDropdown.settings')}</span>
              </span>
            </DropdownMenuItem>
          </CustomNavLink>

          <CustomNavLink to='account/preferences'>
            <DropdownMenuItem>
              <span className='flex items-center gap-x-2'>
                <RiSettings2Line className='size-4 text-inherit' /> <span>{t('UserDropdown.preferences')}</span>
                </span>
              </DropdownMenuItem>
            </NavLink>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => submit(null, { action: '/logout', method: 'post', replace: true })}>
            <span className='flex items-center gap-x-2'>
              <RiLogoutCircleLine className='size-4 text-red-500' />{' '}
              <span className='text-red-500'>{t('UserDropdown.logout')}</span>
            </span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserDropdown;
