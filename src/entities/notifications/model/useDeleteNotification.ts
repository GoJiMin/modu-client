import {useMutation, useQueryClient} from '@tanstack/react-query';
import {deleteNotification} from '../apis/api-service';
import {Notifications} from './type';
import {notificationsKeys} from './query-service';

type MutationVariables = {
  notificationId: number;
  page: number;
};

export function useDeleteNotification() {
  const queryClient = useQueryClient();

  const {mutate, ...rest} = useMutation({
    mutationFn: ({notificationId}: MutationVariables) => deleteNotification(notificationId),
    onMutate: async ({notificationId, page}) => {
      await queryClient.cancelQueries({queryKey: notificationsKeys.page(page)});

      const previousNotifications = queryClient.getQueryData<Notifications>(notificationsKeys.page(page));

      if (previousNotifications) {
        const updatedNotifications = previousNotifications.results.filter(
          notification => notification.id !== notificationId,
        );

        queryClient.setQueryData(notificationsKeys.page(page), {
          ...previousNotifications,
          results: updatedNotifications,
        });
      }

      return {previousNotifications};
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: notificationsKeys.all});
    },
    onError: (_, {page}, context) => {
      if (context) {
        queryClient.setQueryData(notificationsKeys.page(page), context.previousNotifications);
      }
    },
  });

  return {
    deleteNotification: mutate,
    ...rest,
  };
}
