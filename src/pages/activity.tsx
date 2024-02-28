import { type GetServerSideProps, type NextPage } from 'next';
import Head from 'next/head';
import MainLayout from '~/components/Layout/MainLayout';
import { getServerAuthSessionForSSG } from '~/server/auth';
import { SplitType, type User } from '@prisma/client';
import { api } from '~/utils/api';
import { format } from 'date-fns';
import { UserAvatar } from '~/components/ui/avatar';
import { toUIString } from '~/utils/numbers';
import Link from 'next/link';

function getPaymentString(
  user: User,
  amount: number,
  paidBy: number,
  expenseUserAmt: number,
  isSettlement: boolean,
  currency: string,
) {
  if (isSettlement) {
    return (
      <div className={`${user.id === paidBy ? ' text-emerald-500' : 'text-orange-500'} text-sm`}>
        {user.id === paidBy ? 'You paid ' : 'You received '} {currency} {toUIString(amount)}
      </div>
    );
  } else {
    return (
      <div className={`${user.id === paidBy ? ' text-emerald-500' : 'text-orange-500'} text-sm`}>
        {user.id === paidBy
          ? `You paid ${currency}
        ${toUIString(amount - Math.abs(expenseUserAmt))}`
          : `You owe ${currency} ${toUIString(expenseUserAmt)}`}
      </div>
    );
  }
}

const ActivityPage: NextPage<{ user: User }> = ({ user }) => {
  const expensesQuery = api.user.getAllExpenses.useQuery();

  return (
    <>
      <Head>
        <title>Activity</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <MainLayout user={user} title="Activity">
        <div className="h-full px-4">
          <div className="flex flex-col gap-4">
            {expensesQuery.data?.map((e) => (
              <Link href={`/expenses/${e.expenseId}`} key={e.expenseId} className="flex  gap-2">
                <div className="mt-1">
                  <UserAvatar user={e.expense.paidByUser} size={30} />
                </div>
                <div>
                  <p className="text-gray-300">
                    <span className="  font-semibold text-gray-300">
                      {e.expense.paidBy === user.id
                        ? 'You'
                        : e.expense.paidByUser.name ?? e.expense.paidByUser.email}
                    </span>
                    {' paid for '}
                    <span className=" font-semibold text-gray-300">{e.expense.name}</span>
                  </p>
                  <div>
                    {getPaymentString(
                      user,
                      e.expense.amount,
                      e.expense.paidBy,
                      e.amount,
                      e.expense.splitType === SplitType.SETTLEMENT,
                      e.expense.currency,
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{format(e.expense.expenseDate, 'dd MMM')}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </MainLayout>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  return getServerAuthSessionForSSG(context);
};

export default ActivityPage;
