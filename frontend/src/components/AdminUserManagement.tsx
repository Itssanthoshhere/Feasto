import { BiUser } from "react-icons/bi";

const AdminUserManagement = ({ users }: { users: any[] }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
        Registered Users ({users.length})
      </h3>

      <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-slate-100 overflow-hidden dark:bg-slate-800 dark:border-slate-700">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-xs tracking-wider dark:bg-slate-700 dark:text-slate-400">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-10 text-center text-slate-400"
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-slate-50/50 transition-colors dark:hover:bg-slate-700/50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {user.picture ? (
                          <img
                            src={user.picture}
                            className="w-9 h-9 rounded-full object-cover"
                            alt=""
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center dark:bg-slate-600">
                            <BiUser
                              className="text-slate-500 dark:text-slate-300"
                              size={18}
                            />
                          </div>
                        )}
                        <span className="font-bold text-slate-900 dark:text-white">
                          {user.name || "Unknown"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                      {user.email}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          user.role === "admin"
                            ? "bg-purple-50 text-purple-600"
                            : user.role === "restaurant"
                              ? "bg-orange-50 text-orange-600"
                              : user.role === "rider"
                                ? "bg-blue-50 text-blue-600"
                                : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {user.role || "user"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUserManagement;
