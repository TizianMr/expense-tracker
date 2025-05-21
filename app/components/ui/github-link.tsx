import { RiGithubFill } from '@remixicon/react';

const GitHubLink = () => {
  return (
    <a
      aria-label='Github repository link'
      className='mx-auto col-span-5 text-tremor-content-subtle hover:text-tremor-content-strong dark:hover:text-tremor-brand duration-300 ease-in-out underline'
      href='https://github.com/TizianMr/expense-tracker'
      rel='noreferrer'
      target='_blank'>
      <RiGithubFill />
    </a>
  );
};

export default GitHubLink;
