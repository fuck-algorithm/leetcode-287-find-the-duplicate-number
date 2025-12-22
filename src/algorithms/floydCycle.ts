// 算法代码
export const algorithmCode = {
  java: `class Solution {
    public int findDuplicate(int[] nums) {
        int slow = 0;
        int fast = 0;
        // 第一阶段：找到相遇点
        slow = nums[slow];
        fast = nums[nums[fast]];
        while (slow != fast) {
            slow = nums[slow];
            fast = nums[nums[fast]];
        }
        // 第二阶段：找到环入口
        int pre1 = 0;
        int pre2 = slow;
        while (pre1 != pre2) {
            pre1 = nums[pre1];
            pre2 = nums[pre2];
        }
        return pre1;
    }
}`,
  python: `class Solution:
    def findDuplicate(self, nums: List[int]) -> int:
        slow = 0
        fast = 0
        # 第一阶段：找到相遇点
        slow = nums[slow]
        fast = nums[nums[fast]]
        while slow != fast:
            slow = nums[slow]
            fast = nums[nums[fast]]
        # 第二阶段：找到环入口
        pre1 = 0
        pre2 = slow
        while pre1 != pre2:
            pre1 = nums[pre1]
            pre2 = nums[pre2]
        return pre1`,
  golang: `func findDuplicate(nums []int) int {
    slow := 0
    fast := 0
    // 第一阶段：找到相遇点
    slow = nums[slow]
    fast = nums[nums[fast]]
    for slow != fast {
        slow = nums[slow]
        fast = nums[nums[fast]]
    }
    // 第二阶段：找到环入口
    pre1 := 0
    pre2 := slow
    for pre1 != pre2 {
        pre1 = nums[pre1]
        pre2 = nums[pre2]
    }
    return pre1
}`,
  javascript: `var findDuplicate = function(nums) {
    let slow = 0;
    let fast = 0;
    // 第一阶段：找到相遇点
    slow = nums[slow];
    fast = nums[nums[fast]];
    while (slow !== fast) {
        slow = nums[slow];
        fast = nums[nums[fast]];
    }
    // 第二阶段：找到环入口
    let pre1 = 0;
    let pre2 = slow;
    while (pre1 !== pre2) {
        pre1 = nums[pre1];
        pre2 = nums[pre2];
    }
    return pre1;
};`,
};

// 算法思路
export const algorithmThought = `## 快慢指针（Floyd判圈算法）

### 核心思想
将数组看作链表，利用Floyd判圈算法找到环的入口点，即为重复的数字。

### 为什么可以转换为链表？
- 数组下标范围：[0, n]
- 数组值范围：[1, n]
- 将 nums[i] 看作节点 i 指向的下一个节点
- 如果有重复数字，必然形成环

### 算法步骤

**第一阶段：找相遇点**
1. 快指针每次走两步：fast = nums[nums[fast]]
2. 慢指针每次走一步：slow = nums[slow]
3. 当 slow == fast 时，两指针相遇

**第二阶段：找环入口**
1. 将一个指针重置到起点0
2. 两个指针都每次走一步
3. 当两指针相遇时，即为环入口（重复数字）

### 时间复杂度
O(n) - 线性时间

### 空间复杂度
O(1) - 常量空间

### 数学证明
设：
- 起点到环入口距离为 a
- 环入口到相遇点距离为 b
- 相遇点到环入口距离为 c

相遇时：
- 慢指针走了 a + b 步
- 快指针走了 a + b + n(b + c) 步（n为圈数）
- 快指针是慢指针的2倍：2(a + b) = a + b + n(b + c)
- 化简得：a = c + (n-1)(b + c)

所以从起点和相遇点同时出发，必在环入口相遇。`;
